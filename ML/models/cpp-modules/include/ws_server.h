#ifndef WS_SERVER_H
#define WS_SERVER_H

#include <string>
#include <memory>
#include <vector>
#include <mutex>

class WSServer {
public:
    WSServer(unsigned short port);
    ~WSServer();
    void start();
    void stop();
    void broadcast(const std::string& message);

private:
    struct Impl;
    std::unique_ptr<Impl> impl;
};

#endif
