#include "data_structures.h"
#include <iostream>

using namespace std;

LinkedList::LinkedList() {
    head = nullptr;
    length = 0;
}

void LinkedList::insertAtBegining(double val){
    Node* newNode = new Node(val);

    if(length==0){
        head = newNode;
        length = 1;
        return;
    }

    Node* temp = head;
    head = newNode;
    head->next = temp;
    length++;
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
    if(index > length || index < 0){
        return;
    }

    if(index == 0) {
        insertAtBegining(val);
        return;
    }

    if(index == length){
        insertAtEnd(val);
        return;
    }

    Node* newNode =  new Node(val);
    Node* temp = head;

    for(int i=0;i<index-1;i++){
        temp = temp->next;
    }

    newNode->next = (temp->next)->next;
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

int LinkedList::getLength() {
    return length;
}