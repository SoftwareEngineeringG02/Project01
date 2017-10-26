#!/bin/bash

#
# Server installer for
#

set -e

program_name=$(basename "$0")
nvm_git="https://github.com/creationix/nvm.git"
node_version="8.7.0"

function say {
    echo "${program_name}: *** $@"
}

function die {
    say "Error: $@" >&2
    exit 1
}

# Check the installation environment.
function check_env {
    # Check for git.
    [[ -x $(which git) ]] || die "Git is required but it was not found"
}

# Install Node.js if required
function install_node {
    if [[ -x $(which node) && "x$(node --version)" = "x${node_version}" ]]; then
        say "Correct version of node is already installed"
    else
        say "Node is not installed or is not the right version, installing version ${node_version}"
        # Clone and install NVM
        git clone "${nvm_git}"
        pushd nvm
        ./install.sh
        popd
        # Source .bashrc to get NVM in the path
        . ~/.bashrc
        # Install Node with NVM
        nvm install "${node_version}"
        nvm use "${node_version}"
    fi
}

# Install dependencies.
function install_deps {
    # Get dependencies with NPM
    npm install
    say "Installation complete; say './launch-server' to start server"
}

check_env
install_node
install_deps
