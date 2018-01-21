#!/usr/bin/env bash

openssl req -newkey rsa:4096 -days 1001 -nodes -x509 -keyout testing.key -out testing.crt -sha256 -extfile v3.ext
