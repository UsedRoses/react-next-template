#!/bin/sh
docker rm -f $(docker ps -a --filter "name=next-app" -q)

# 1. 打包代码镜像 (完全套用你的格式)
docker build --rm -f docker/Dockerfile.CodeUS -t registry-vpc.us-west-1.aliyuncs.com/zingfront/next-app:test .

# 2. 运行
docker run --name next-app-`date "+%Y-%m-%d-%H-%M"` \
  -d -p 10135:80 \
  --restart=always \
  registry-vpc.us-west-1.aliyuncs.com/zingfront/next-app:test