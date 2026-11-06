import {build}from'vite';await build({build:{outDir:'output/phone-review-build',rollupOptions:{input:'phone-review.html'}},logLevel:'error'});console.log('review built');
