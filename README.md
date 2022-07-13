# Light

Documentation Server created by [ondecentral](https://ondecentral.com)

## Pre-reqs

Remember if we are hosting static with node, we must run first:  

```zsh
cp -r book static
```


#### Assumptions
* Cloud instance is running RHEL and has node installed with package management tool `dnf`
* Cloud instance has `http-server` installed non-globally with npm
* Cloud instance has rust installed with dnf and `cargo install mdbook` has been ran in `cd ~`
* Cloud instance security group has ports 3000-3500 open
* Machine does _not_ come with an installation of `pm2`  that was installed using npm i `-g`

### Install Dev Dependencies

Install pm2 non-globally 

```zsh
npm i pm2
```


Install rest of of deps

```zsh
npm i
```

Create symbolic link for pm2 executable (this won't work on Windows)

```zsh
ln -s ./node_modules/pm2/bin/pm2 pm2
```

Verify it works by running the first command below and seeing a table in your command line

```zsh
./pm2 list
npm run start-host
```

Then validate server is running on port correctly

```zsh
./pm2 logs
```

### Day One

Setting Nginx connection to localhost:5060



### Day Two 

Engineers who have made it past day one, congratulations. 

```
inner-doc-server-rs/
├── app
├── book
└── src
    ├── chapter_1.md
    ├── chapter_2.md
    ├── chapter_3.md
    ├── chapter_4.md
    └── SUMMARY.md
```

## 🙆‍♀️ How to run Documentation Server with mdbook

If new dev environment for rust

```bash
rustup default stable
cargo install mdbook
```

```bash
mdbook serve 
```

### Run this if using the Node Server to Host

```bash
mdbook build
```

If you are attempting to run mdbook in cloud: Make sure you have cargo bin in your path if its a fresh instance

```zsh
export PATH=$PATH:/home/ec2-user/.cargo/bin
```

## 🙆‍♀️ How to run Documentation Server in Prod

```bash
npm run start-prod
```

This will run a daemon on port 3200

```zsh
pm2 start app/index.js
pm2 logs 0
```

Validate the logs showing the port number then go to your browser to verify

```
http://<hostname>:<port>/book
```

## 💁 How to use Fullstack App


```zsh
mdbook build
rm -rf static/book
mv book static
node app/index.js
```


##  💁 Ubuntu 20 - Steps Summarized in order


* For the cloud nginx config cd into `/etc/nginx` and check on `/sites-available`
* Use `git pull <remote> <branch>` for designated stage env
* Reminder to not use absolutes for `express.static()` when needing to run node on output of `mdbook build`
* Lastly make sure nginx is running
* If on premise uswest build the book with `mdbook build` then transfer it to `~/www/uswest`
* Modify ETC Hosts file



##  💁 Apple Server - Steps Summarized in order


* For the domain connection please cd into `/etc/nginx` and check on conf.d
* Use `git pull <remote> <branch>` for designated stage env
* Lastly make sure nginx is running
* If on premise uswest build the book with `mdbook build` then transfer it to `~/www/uswest`
* Ensure user and group permissions are set to be `755` so nginx can load pages, otherwise 403
* Double check nginx config for `user` directive which is up one level from event and http
* Ensure user and group in directive matches user and group in `nginx.conf` file
* Verify it works by navigating in a browser and expect `<ip_addr>:<port>` is online
* 🙅‍ Verify the domain works by going to the domain dot com directly with and without www

## How to get started 

### The directories

`app`

Documentation server markdown files

`src`

Documentation and spec

### Assume you have the following dependencies
- Rust `rustc` and `cargo`
- Cargo bin in path
- mdbook installed via cargo or from source

  

```bash
git clone
```

then

```bash
cd distribution-center
```


### To serve test server

```bash
mdbook serve 
```
  


The src directory is were you write your book in markdown. It contains all the source files, configuration files, etc.

The book directory is where your book is rendered. All the output is ready to be uploaded to a server to be seen by your audience.

The SUMMARY.md file is the most important file, it's the skeleton of your book and is discussed in more detail in another chapter.


### Intricacies of serving on a subdomain

If you want to host this documentation server on a subdomain

1. First we assume nginx has already been set up with HTTPS and SSL. If not, consult the general documentation server
2. Ensure the order of the `sites-enabled/default` config file has the subdomain's server block appear first (on the top of the file)
3. You will need to create redirects, essentially extrapolation of two other server blocks from a standard non-subdomain ssl nginx config
4. Run `sudo nginx -t` to test if valid config, then `sudo systemctl restart nginx`. Verify status of nginx is okay then navigate to `/book` over HTTPS

### Updating the documentation server on a subdomain

1. git pull 
2. run commands below

```zsh
mdbook build
rm -rf static/book
mv book static
node app/index.js
```


# Troubleshooting

If you are running into port issues on cloud Ubuntu PM2, typically when running a reverse proxy via Nginx. Try the following

* Remove hidden configuration file in home directory `rm -rf ~/.pm2`

If you are testing subdomains host over ssl and using `http-server`, it will most likely not work due to cors needing to be enabled (disabled by default)





