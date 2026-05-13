#include "ws_server.h"
#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <boost/asio/strand.hpp>
#include <algorithm>
#include <cstdlib>
#include <functional>
#include <iostream>
#include <memory>
#include <string>
#include <thread>
#include <vector>
#include <set>

namespace beast = boost::beast;         
namespace http = beast::http;           
namespace websocket = beast::websocket; 
namespace net = boost::asio;            
using tcp = boost::asio::ip::tcp;       

class Session : public std::enable_shared_from_this<Session> {
    websocket::stream<beast::tcp_stream> ws_;
    beast::flat_buffer buffer_;
    std::function<void(std::shared_ptr<Session>)> on_close_;

public:
    explicit Session(tcp::socket&& socket, std::function<void(std::shared_ptr<Session>)> on_close)
        : ws_(std::move(socket)), on_close_(on_close) {}

    void run() {
        net::dispatch(ws_.get_executor(),
            beast::bind_front_handler(&Session::on_run, shared_from_this()));
    }

    void on_run() {
        ws_.set_option(websocket::stream_base::timeout::suggested(beast::role_type::server));
        ws_.async_accept(beast::bind_front_handler(&Session::on_accept, shared_from_this()));
    }

    void on_accept(beast::error_code ec) {
        if(ec) return;
        do_read();
    }

    void do_read() {
        ws_.async_read(buffer_, beast::bind_front_handler(&Session::on_read, shared_from_this()));
    }

    void on_read(beast::error_code ec, std::size_t bytes_transferred) {
        boost::ignore_unused(bytes_transferred);
        if(ec == websocket::error::closed) {
            on_close_(shared_from_this());
            return;
        }
        if(ec) return;
        ws_.text(ws_.got_text());
        ws_.async_write(buffer_.data(), beast::bind_front_handler(&Session::on_write, shared_from_this()));
    }

    void on_write(beast::error_code ec, std::size_t bytes_transferred) {
        boost::ignore_unused(bytes_transferred);
        if(ec) return;
        buffer_.consume(buffer_.size());
        do_read();
    }

    void send(const std::string& message) {
        auto msg = std::make_shared<std::string>(message);
        net::post(ws_.get_executor(), [this, self = shared_from_this(), msg]() {
            ws_.text(true);
            ws_.async_write(net::buffer(*msg), [self, msg](beast::error_code ec, std::size_t) {
                if(ec) return;
            });
        });
    }
};

struct WSServer::Impl {
    net::io_context ioc;
    tcp::acceptor acceptor;
    std::thread thread;
    std::set<std::shared_ptr<Session>> sessions;
    std::mutex sessions_mutex;

    Impl(unsigned short port) : acceptor(ioc, tcp::endpoint(tcp::v4(), port)) {
        beast::error_code ec;
        acceptor.set_option(net::socket_base::reuse_address(true), ec);
        if(ec) {
            std::cerr << "Error setting reuse_address: " << ec.message() << std::endl;
        }
    }

    void do_accept() {
        acceptor.async_accept(net::make_strand(ioc), [this](beast::error_code ec, tcp::socket socket) {
            if(!ec) {
                auto session = std::make_shared<Session>(std::move(socket), [this](std::shared_ptr<Session> s) {
                    std::lock_guard<std::mutex> lock(sessions_mutex);
                    sessions.erase(s);
                });
                {
                    std::lock_guard<std::mutex> lock(sessions_mutex);
                    sessions.insert(session);
                }
                session->run();
            }
            do_accept();
        });
    }
};

WSServer::WSServer(unsigned short port) : impl(std::make_unique<Impl>(port)) {}

WSServer::~WSServer() { stop(); }

void WSServer::start() {
    impl->do_accept();
    impl->thread = std::thread([this]() { impl->ioc.run(); });
}

void WSServer::stop() {
    impl->ioc.stop();
    if(impl->thread.joinable()) impl->thread.join();
}

void WSServer::broadcast(const std::string& message) {
    std::lock_guard<std::mutex> lock(impl->sessions_mutex);
    for(auto& session : impl->sessions) {
        session->send(message);
    }
}
