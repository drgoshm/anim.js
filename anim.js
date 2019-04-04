(function(context) {
	context.Anim = function(){
		const _setValue = (o, p, v) => !o || !o.hasOwnProperty(p) || (o[p] = v),
			timings = {
				'linear': p => p,
				'circ': p => p < 0 ? 0 : p > 1 ? 1 : 1 - Math.sin(Math.acos(p)),
				'bounce': p =>  { for (let a = 0, b = 1; 1; a += b, b /= 2) {
					if (p >= (7 - 4 * a) / 11) {
						return -Math.pow((11 - 6 * a - 11 * p) / 4, 2) + b * b;
					}
				}},
				'elastic': p => Math.pow(2, 20 * (p - .8)) * Math.cos( 12 * p * p- 12) / 16
			},
			ease = {
				'in': f => f,
				'out': (f) => (p) => 1 - f(1 - p),
				'both': (f) => (p) => p < .5 ? f(2 * p) / 2 : (2 - f(2 * (1 - p))) / 2
			};
		this.add = function (id, duration) {
			if(id == 'update' || id == 'add' || typeof duration !== 'number') return;
			const a = {
					duration: duration,
					progress: 0,
					started: false,
					timing: timings['linear'],
					ease: ease['in'],
					run: () => {this.started = true; this.timeStart = Date.now();}
				},
				r = {anim: this, 
					timing: (t, e = 'in') => {
						a.timing = typeof t === 'function' ? t : timings[t] || timings['linear'];
						a.ease = ease[e] || ease['in'];
						return r;
					},
					for: (obj, prop) => {
						a.object = obj;
						a.property = prop;
						return r;
					},
					from: (v) => {
						a.from = v;
						return r;
					},
					to: (v) => {
						a.to = v;
						return r;
					},
					tick: (tick) => {
						a.tick = tick;
						return r;
					},
					after: (after) => {
						a.after = after;
						return r;
					},
					run: () => {
						a.started = true;
						a.timeStart = Date.now();
						return r;
					}
				};
			this[id] = a;
			return r;
		};
		this.update = function (t) {
			let r = false;
			for (let index in this) {
				const f = this[index];
				if (typeof f !== 'object') continue;
				if(!f.started) {
					f.timeStart = t - f.duration * f.progress;
					continue;
				}
				f.progress = (t - f.timeStart) / f.duration;
				r = true;
				if (f.progress >= 1 || isNaN(f.progress) || (typeof f.from === 'number' && f.from === f.to)) {
					if (typeof f.to === 'number') _setValue(f.object, f.property, typeof f.tick === 'function' ? f.tick(f.to) || f.to : f.to);
					if (typeof f.after === 'function') 	f.after.call(this);
					delete this[index];
					continue;
				}
				const value = typeof f.from === 'number' && typeof f.to === 'number' ? (f.to - f.from) * f.ease(f.timing)(f.progress) + f.from : f.ease(f.timing)(f.progress);
				_setValue(f.object, f.property, typeof f.tick === 'function' ? f.tick(value) || value : value);
			}
			return r;
		};
		this.loop = function(){
			this.update(Date.now());
			window.setTimeout(this.loop.bind(this), 1e3 / 60);
		};
	};
// eslint-disable-next-line no-undef
})(typeof exports === 'undefined' ? window : exports);
