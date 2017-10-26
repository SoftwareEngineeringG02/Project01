#!/bin/bash

#
# Server installation script.
#

program_name=$(basename "$0")
nvm_git="https://github.com/creationix/nvm.git"
node_version="8.7.0"
github_url="https://github.com"
project_name="SoftwareEngineeringG02/Project01"
project_branch="chris-server"
project_git="${github_url}/${project_name}.git"
project_dir=$(basename "${project_name}")
server_dir="server"

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

# Download the server from Github.
function get_server {
    git clone "${project_git}"
    [[ -d "${project_dir}" ]] || die "Failed to clone Git repository: No directory ${project_dir}"
    cd "${project_dir}"
    git checkout "${project_branch}"
    [[ -d "${server_dir}" ]] || die "Failed to clone Git repository: No directory ${server_dir}"
    cd "${server_dir}"
}

# Install Node.js if required
function install_node {
    if [[ -x $(which node) && "x$(node --version)" = "xv${node_version}" ]]; then
        say "Correct version of node is already installed"
    else
        say "Node is not installed or is not the right version, installing version ${node_version}"
        # Clone and install NVM
        git clone "${nvm_git}"
        pushd nvm
        ./install.sh
        popd
        # Install Node with NVM.
        export NVM_DIR="$HOME/.nvm"
        . "$NVM_DIR/nvm.sh"
        . "$NVM_DIR/bash_completion"
        nvm install ${node_version}
    fi
}

# Install dependencies.
function install_deps {
    # Get dependencies with NPM
    npm install
    say "Installation complete; say '${project_dir}/${server_dir}/launch-server' to start server"
}

check_env
get_server
install_node
install_deps
