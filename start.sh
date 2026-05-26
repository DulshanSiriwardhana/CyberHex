#!/bin/bash

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
    fi
fi

if [ ! -f backend/.env ]; then
    if [ -f backend/.env.example ]; then
        cp backend/.env.example backend/.env
    fi
fi

npm run dev
