# CSS GZip Minifier

A port of barryvan's [CssMin](https://github.com/barryvan/CSSMin) project to JS/npm.

From the original github page:

> CSSMin takes your CSS file and strips out everything that’s not needed — spaces, extra semicolons, redundant units, and so on. That’s great, but there are loads of programs that do that. A shell script could do that! So what makes CSSMin different?

> When you deliver content over the web, best practice is to deliver it gzipped. CSSMin takes your CSS file, and optimises it for gzip compression. This means that there’s a smaller payload delivered over the wire, which results in a faster experience for your users. It does this optimisation by ensuring that the properties inside your selectors are ordered consistently (alphabetically) and in lower case. That way, the gzip algorithm can work at its best.
  
> What this means in practice is that your gzipped CSSMin-ed files are significantly smaller than plain gzipped CSS, and noticeably smaller than files that have been compressed by other means (say, YUI).