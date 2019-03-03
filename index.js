var Mustache = require('mustache')
var marked = require('marked')
var mdtoc = require('markdown-toc')
var fs = require('fs')

// markdown source
var index = fs.readFileSync('./index.md', 'utf8')
var tmpl = fs.readFileSync('./index.mustache', 'utf8')

var tocmd = mdtoc(index, {firsth1: false}).content

// set the tmpl variables
var view = {
  content: marked(index),
  toc: marked(tocmd),
}

// tmpl render
var out = Mustache.render(tmpl, view)

console.log(out)
