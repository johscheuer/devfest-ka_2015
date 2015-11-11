# Version 0.0.1
FROM centos:centos7
MAINTAINER Johannes M. Scheuermann "jscheuermann@inovex.de"
ENV REFRESHED_AT 2015-06-02

# Enable EPEL for Node.js
RUN curl -sL https://rpm.nodesource.com/setup | bash -

# Install Node.js and npm
RUN yum install -y nodejs gcc gcc-c++ kernel-devel make python
# Bundle app source
COPY . /src

# Install app dependencies
RUN cd /src; npm install
EXPOSE  9090
CMD ["node", "/src/index.js"]
