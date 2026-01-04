#!/bin/sh
# 这里的名字你可以根据后端习惯命名
docker build -f docker/Dockerfile.Base -t registry-vpc.us-west-1.aliyuncs.com/zingfront/next-base:node24 .
#docker push registry-vpc.us-west-1.aliyuncs.com/zingfront/next-base:node24