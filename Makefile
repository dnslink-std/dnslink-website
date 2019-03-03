
build: index.html

index.html: index.mustache index.md index.js
	node index.js >$@

publish: build bin/ipfs-dumver
	bin/ipfs-dumver .

# dependecies -------

deps: node_modules bin/ipfs-dumver

node_modules:
	@which node >/dev/null || (echo "please install node" && false)
	@which npm >/dev/null || (echo "please install npm" && false)
	npm install

bin/ipfs-dumver:
	mkdir -p bin
	@which ipfs >/dev/null || (echo "please install ipfs" && false)
	ipfs get -o bin/ipfs-dumver QmfS9Jk9HGz3gmYFno4HS37KdP6kiG4etLF38rx6ZUwJns
	chmod +x bin/ipfs-dumver
