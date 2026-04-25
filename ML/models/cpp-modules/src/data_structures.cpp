#include "data_structures.h"
#include <iostream>

using namespace std;

LinkedList::LinkedList() {
    head = nullptr;
    length = 0;
}

void LinkedList::insertAtEnd(double val) {
    Node* newNode = new Node(val);

    if (head == nullptr) {
        head = newNode;
        length = 1;
        return;
    }

    Node* temp = head;

    while(temp->next != nullptr){
        temp = temp->next;
    }

    temp->next = newNode;
    length++;  
}

void LinkedList::insertAt(int index, double val) {
    Node* temp = head;
    if(temp == nullptr) {
        if(index == 0){
            Node* newNode = Node(val);
            head = newNode;
        }
        return;
    }

    for(int i=0;i<index;i++){
        temp = temp->next;

        if(temp->nullptr)
    }


}

void LinkedList::display() {
    Node* temp = head;

    while(temp != nullptr) {
        cout << temp << " : " << temp->data << endl;
        temp = temp->next;
    }

    cout << "NULL" << endl;
}