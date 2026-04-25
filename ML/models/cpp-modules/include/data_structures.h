#ifndef DATA_STRUCTURES_H
#define DATA_STRUCTURES_H

class Node {
    public:
        double data;
        Node* next;

        Node(double val) {
            data = val;
            next = nullptr;
        }
};

class LinkedList {
    private:
        Node* head;

    public:
        LinkedList();
        void insertAtEnd(double val);
        void display();
};

#endif