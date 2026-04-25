#include "data_structures.h"
#include <iostream>

using namespace std;

LinkedList::LinkedList() {
    head = nullptr;
}

void LinkedList::insertAtEnd(double val) {
    Node* newNode = new Node(val);

    if (head == nullptr) {
        head = newNode;
        return;
    }

    Node* temp = head;

    while(temp->next != nullptr){
        temp = temp->next;
    }

    temp->next = newNode;  
}

void LinkedList::display() {
    Node* temp = head;

    while(temp != nullptr) {
        cout << temp << " : " << temp->data << endl;
        temp = temp->next;
    }

    cout << "NULL" << endl;
}