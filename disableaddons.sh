#!/bin/sh

appname=${0##*/}
appname=${appname%.sh}

buildscript/makexpi.sh -n $appname -o
