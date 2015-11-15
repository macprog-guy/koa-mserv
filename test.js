'use strict'

var forward   = require('.'),
	chai      = require('chai'),
	should    = chai.should(),
	Koa       = require('koa'),
	KoaRouter = require('koa-router'),
	body      = require('koa-better-body'),
	request   = require('supertest')


// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------


// ----------------------------------------------------------------------------
// Custom
// ----------------------------------------------------------------------------

describe("koa-mserv", function(){

	var _app     = null,
		_router  = null,
		_action  = null,
		_command = null,
		_forward = null

	beforeEach(function(done){		
		
		_app     = Koa()
		_router  = new KoaRouter({prefix:'/api'})
		_action  = null,
		_command = null
		
		_app.mserv = {
			action:  function*(name, params, headers) { _action  = {name, params, headers}; return {status:'action' }},
			command: function (name, params, headers) { _command = {name, params, headers}; return {status:'command'}}
		}

		// _app.use(function*(next){
		// 	try {
		// 		yield next
		// 	}
		// 	catch(err) {
		// 		console.error(err.stack)
		// 		throw err
		// 	}
		// })

		_app.use(body({fieldsKey:false, multipart:false}))

		done()
	})


	it('GET request should be forwarded', function(done){

		_router.get('/foo', forward.action('domain.foo.fetch'))
		_app.use(_router.middleware())

		request.agent(_app.listen())
		.get('/api/foo')
		.expect(200)
		.end(function(err, res){

			if (err) return done(err)

			res.body.should.eql({status:'action'})
			_action.should.eql({name:'domain.foo.fetch',params:{},headers:{}})
			
			done()
		})
	})

	it('GET request with id should be forwarded', function(done){

		_router.get('/foo/:id', forward.action('domain.foo.fetch.byId'))
		_app.use(_router.middleware())

		request.agent(_app.listen())
		.get('/api/foo/123')
		.expect(200)
		.end(function(err, res){

			if (err) return done(err)

			res.body.should.eql({status:'action'})
			_action.should.eql({name:'domain.foo.fetch.byId',params:{id:'123'},headers:{}})
			
			done()
		})
	})

	it('CRUD GET / should map to list action', function(done){

		forward.crud(_router,'/foo','domain.foo')
		_app.use(_router.middleware())

		request.agent(_app.listen())
		.get('/api/foo')
		.expect(200)
		.end(function(err, res){

			if (err) return done(err)

			res.body.should.eql({status:'action'})
			_action.should.eql({name:'domain.foo.fetch',params:{},headers:{}})
			
			done()
		})
	})


	it('CRUD GET /id should map to get action', function(done){

		forward.crud(_router,'/foo','domain.foo')
		_app.use(_router.middleware())

		request.agent(_app.listen())
		.get('/api/foo/123')
		.expect(200)
		.end(function(err, res){

			if (err) return done(err)

			res.body.should.eql({status:'action'})
			_action.should.eql({name:'domain.foo.fetch.byId',params:{id:'123'},headers:{}})
			
			done()
		})
	})

	it('CRUD POST / should map to create action', function(done){

		forward.crud(_router,'/foo','domain.foo')
		_app.use(_router.middleware())

		request.agent(_app.listen())
		.post('/api/foo')
		.send({name:'todo1', done:'false'})
		.expect(200)
		.end(function(err, res){

			if (err) return done(err)

			res.body.should.eql({status:'action'})
			_action.should.eql({name:'domain.foo.create',params:{name:'todo1', done:'false'}, headers:{}})
			
			done()
		})
	})


	it('CRUD PATCH / should map to update action', function(done){

		forward.crud(_router,'/foo','domain.foo')
		_app.use(_router.middleware())

		request.agent(_app.listen())
		.patch('/api/foo')
		.send({id:'1234', name:'todo1', done:'false'})
		.expect(200)
		.end(function(err, res){

			if (err) return done(err)

			res.body.should.eql({status:'action'})
			_action.should.eql({name:'domain.foo.update',params:{id:'1234', name:'todo1', done:'false'}, headers:{}})
			
			done()
		})
	})

	it('CRUD PATCH /:id should map to update action', function(done){

		forward.crud(_router,'/foo','domain.foo')
		_app.use(_router.middleware())

		request.agent(_app.listen())
		.patch('/api/foo/1234')
		.send({name:'todo1', done:'false'})
		.expect(200)
		.end(function(err, res){

			if (err) return done(err)

			res.body.should.eql({status:'action'})
			_action.should.eql({name:'domain.foo.update',params:{id:'1234', name:'todo1', done:'false'}, headers:{}})
			
			done()
		})
	})

	it('CRUD PUT / should map to merge action', function(done){

		forward.crud(_router,'/foo','domain.foo')
		_app.use(_router.middleware())

		request.agent(_app.listen())
		.put('/api/foo')
		.send({id:'1234', name:'todo1', done:'false'})
		.expect(200)
		.end(function(err, res){

			if (err) return done(err)

			res.body.should.eql({status:'action'})
			_action.should.eql({name:'domain.foo.merge',params:{id:'1234', name:'todo1', done:'false'}, headers:{}})
			
			done()
		})
	})

	it('CRUD PUT /:id should map to merge action', function(done){

		forward.crud(_router,'/foo','domain.foo')
		_app.use(_router.middleware())

		request.agent(_app.listen())
		.put('/api/foo/1234')
		.send({name:'todo1', done:'false'})
		.expect(200)
		.end(function(err, res){

			if (err) return done(err)

			res.body.should.eql({status:'action'})
			_action.should.eql({name:'domain.foo.merge',params:{id:'1234', name:'todo1', done:'false'}, headers:{}})
			
			done()
		})
	})

	it('CRUD DELETE / should return 404 not found', function(done){

		forward.crud(_router,'/foo','domain.foo')
		_app.use(_router.middleware())

		request.agent(_app.listen())
		.del('/api/foo')
		.send({})
		.expect(404)
		.end(function(err, res){
			if (err) return done(err)
			done()
		})
	})

	it('CRUD DELETE / should return 404 not found', function(done){

		forward.crud(_router,'/foo','domain.foo')
		_app.use(_router.middleware())

		request.agent(_app.listen())
		.del('/api/foo/1234')
		.send({})
		.expect(200)
		.end(function(err, res){

			if (err) return done(err)

			res.body.should.eql({status:'action'})
			_action.should.eql({name:'domain.foo.delete.byId',params:{id:'1234'}, headers:{}})
			
			done()
		})
	})
})

