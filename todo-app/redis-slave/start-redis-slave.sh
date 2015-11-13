#!/bin/bash

echo "Start redis slave redmis-master 6379"

redis-server --slaveof redis-master 6379
