'use strict'

var Case = require('case'),
	_    = require('lodash'),
	forward



module.exports = forward = {

	action: function(name, options) {

		if (_.isPlainObject(name)) {
			options = name
			name    = undefined
		} 

		return function*() {

			var params, headers, opts

			opts    = expandedOptions(this, name, options)
			params  = opts.params,
			headers = opts.headers,
			name    = opts.name

			if (opts.command) {
				this.app.mserv.command(name, params, headers)
				this.response.body = {status:200}
			}
			else {
				this.response.body = yield this.app.mserv.invoke(name, params, headers)
			}
		}
	},

	command: function(name, options) {

		options = options || {}
		options.command = true

		return forward.action(name, options)
	},


	crud: function(router, path, action, options) {

		var opts, key, byKey

		options = _.defaults(options || {}, {key:'id', create:true, read:true, update:true, del:true, merge:true, prefix:action})
		key     = options.key
		byKey   = Case.camel('by-'+key)

		if (options.create) {
			router.post(path, forward.action('create', options))
		}
		
		if (options.read) {
			router.get(path, forward.action('fetch',options))
			router.get(path + '/:'+key, forward.action('fetch.'+byKey, options))
		}
		
		if (options.update) {
			router.patch(path, forward.action('update', options))
			router.patch(path + '/:'+key, forward.action('update', options))
		}

		if (options.merge) {
			router.put(path, forward.action('merge', options))
			router.put(path + '/:'+key, forward.action('merge', options))
		}

		if (options.del) {
			// We don't map to "delete.all"
			router.del(path + '/:'+key, forward.action('delete.'+byKey, options))
		}

		return router
	}
}


// ----------------------------------------------------------------------------
// Common Functions
// ----------------------------------------------------------------------------

function expandedOptions(ctx, name, options) {

	options = options || {}

	var params  = options.params  || {},
		name    = name || options.name  || '',
		headers = options.headers || {}

	// Expand function type params
	if (typeof params === 'function')
		params = params(ctx, options)

	// Expand function type headers
	if (typeof headers === 'function')
		headers = headers(ctx, options)

	// Expand function type action
	if (typeof name === 'function')
		name = name(ctx, options)

	// Make simple validations
	if (typeof name !== 'string')
		throw new TypeError('name should be a string')

	if (!_.isPlainObject(params))
		throw new TypeError('params should be an object or a function returning an object')

	if (!_.isPlainObject(headers))
		throw new TypeError('headers should be an object or a function returning an object')

	// Merge request body, params and options params
	params = _.merge({}, ctx.request.body || {}, ctx.query, ctx.params, params)

	// Add the prefix to the action
	if (typeof options.prefix === 'string')
		name = options.prefix + '.' + name

	return {name, params, headers}	
}


