# Introduction
Koa-mserv is used to facilitate the mapping of koa routes to mserv actions. It automatically forwards 
credentials and request body to the service in question.

# Installation

	$ npm i --save koa-mserv

# Usage

```js

var koa   = require('koa'),
	proxy = require('koa-mserv'),


router.get('/resource', forward(ctx => ctx.request.body.id? 'domain.resource.fetch.byId' : 'domain.resource.fetch')
router.get('/resource/:id', forward('domain.resource.fetch.byId'))
router.post('/resource', forward('domain.resource.create'))
router.patch('/resource', forward('domain.resource.update'))
router.put('/resource', forward('domain.resource.merge'))
router.delete('/resource', forward('domain.resource.delete.byId'))
router.delete('/resource/:id', forward('domain.resource.delete.byId'))

router.crud('/resource', 'domain.resource', {create:true, read:true, update:true, merge:true, delete:true})


router.get('/scoped/:scopeId/items', forward(...))
	
}))

```

