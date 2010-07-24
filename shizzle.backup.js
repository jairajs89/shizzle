(function() {
	var $$ = Array;
	$$.prototype.size = function() {
		return this.length;
	};
	$$.prototype.get = function(n) {
		return (n)?this[n]:this;
	};
	$$.prototype.concat2 = function(arr) {
		$$.prototype.push.apply(this, arr);
	};
	$$.prototype.search = function(elem) {
		for(var i=this.length; i--;) {
			if(this[i]==elem) {
				return i;
			}
		}
		return -1;
	};
	$$.prototype.contains = function(elem) {
		return this.search(elem)!=-1;
	};
	$$.prototype.unique = function() {
		for(var i=0, l=this.length; i<l; ++i) {
			for(var j=i+1; j<l; ++j) {
				if(this[i]==this[j]) {
					this.splice(j,1);
					--l;
					//this.splice(i,1);
					//--i, --l;
					//break;
				}
			}
		}
	};
	var tester = document.createElement('div');
	var nextSibling = ('nextElementSibling' in tester)?
		function(elem) {
			return elem.nextElementSibling;
		}:
		function(elem) {
			while((elem=elem.nextSibling) && elem.nodeType!=1) {}
			return elem;
		};
	var previousSibling = ('previousElementSibling' in tester)?
		function(elem) {
			return elem.previousElementSibling;
		}:
		function(elem) {
			while((elem=elem.previousSibling) && elem.nodeType!=1) {}
			return elem;
		};
	var firstChild = ('firstElementChild' in tester)?
		function(elem) {
			return elem.firstElementChild;
		}:
		function(elem) {
			for(elem=elem.firstChild; elem.nodeType!=1 && (elem=elem.nextSibling);) {}
			return elem;
		};
	var lastChild = ('lastElementChild' in tester)?
		function(elem) {
			return elem.lastElementChild;
		}:
		function(elem) {
			for(elem=elem.lastChild; elem.nodeType!=1 && (elem=elem.previousSibling);) {}
			return elem;
		};
	var childCount = ('childElementCount' in tester)?
		function(elem) {
			return elem.childElementCount;
		}:
		function(elem) {
			var c = 0;
			if(elem=firstChild(elem)) {
				do {
					++c;
				} while(elem=nextSibling(elem));
			}
			return c;
		};
	var getByClass = ('getElementsByClassName')?
		function(e,c) {
			return e.getElementsByClassName(c);
		}:
		function(e,c) {
			alert('getElementsByClassName not implemented');
		};
	var getById = function(e,i) {
		return document.getElementById(i);
	};
	var getByTags = function(e,t) {
		return e.getElementsByTagName(t);
	};
	tester = null;
	var $;
	if(false) {
	//if(document.querySelectorAll) {
		//todo: noncompliance in certain browsers
		$ = function(selector) {
			var elems = new $$();
			for(var nl=document.querySelectorAll(selector), i=0, l=nl.length; i<l; elems.push(nl[i++])) {}
			return elems;
		};
	} else {
		//Reusable regular expressions
		//todo: add :not support for attr,colon
		var r = {
			white:		/\s+/,
			word:		/(\w|-)+/g,
			digeq:		/(\d|\=)/,
			header:		/^h\d$/i,
			comma:		/,/g,
			pOpen:		/\(/g,
			pClose:		/\)/g,
			id:			/\#(\w|-)+/,
			className:	/\.(\w|-)+/g,
			tag:		/^(\w|-|\*)+/,
			attr:		/\[(\w|-)+([\|\*~\$!\^]?\=[\'\"]?(\w|-)*[\'\"]?)?\]/g,
			attrEq:		/[\|\*~\$!\^]?\=/,
			colon:		/\:(\w|-)+(\(((\w|-|\+)+|(\w+)?(\.(\w|-)+|\#(\w|-)+|\[(\w|-)+([\|\*~\$!\^]?\=(\w|-)+)?\]|\:(\w|-)+(\((\w|-|\+)+\))?)*)\))?/g
		};
		
		//Get all tags based on given function
		//todo: its slow, make faster!!
		var uniqueAscenstors = function(l) {
			var elems = new $$(l[0]);
			var cache1 = l[0], cache2, cache3;
			uniqueloop:for(var j=1, lj=l.length; j<lj; ++j) {
				cache2 = l[j];
				if(cache2.parentNode!=cache1.parentNode) {
					while(cache2=cache2.parentNode) {
						if(cache2==cache3 || cache2==cache1) {
							cache3 = l[j].parentNode;
							continue uniqueloop;
						}
					}
				}
				cache1 = l[j];
				elems.push(cache1);
			}
			return elems;
		};
		var getter = function(parents, fn, matcher) {
			var elems = uniqueAscenstors(parents);
			var found = new $$();
			for(var j=0, lj=elems.length; j<lj;) {
				for(var tags=fn(elems[j++], matcher), k=0, lk=tags.length; k<lk; ++k) {
					found.push(tags[k]);
				}
			}
			return found;
		};
		
		//Check whether point in select is in negation-pseudo-element
		var inNot = function(selector, i) {
			selector = selector.substr(0,i);
			var pOpen = selector.match(r.pOpen);
			var pClose = selector.match(r.pClose);
			return ((pOpen)?pOpen.length:0)!=((pClose)?pClose.length:0);
		};
		
		//Extract nth-elements
		//todo: so slow, fix!!
		var nth = function(fn,found) {
			fn = fn.replace(r.white,'');
			var p = fn.indexOf('n');
			var c1, c0 = parseInt(fn.substr(p+1)) || 0;
			if(p!=-1) {
				c1 = (p && fn[p-1]=='-')?-1:(parseInt(fn.substr(0,p)) || 1);
			} else {
				c1 = 0;
			}
			if(c0<0 && c1<=0) {
				return new $$();
			} else if(c1==0) {
				return (found[c0])?new $$(found[c0]):new $$();
			} else if(c1==1) {
				if(c0) {
					return (c0>0)?found.slice(c0-1):found.slice(0,-c0);
				} else {
					return found;
				}
			}
			var elems = new $$();
			var cache1 = new $$();
			var cache2 = new $$();
			var cache3 = new $$();
			for(var k,ee0,cc0,j=0,lj=found.length; j<lj; ++j) {
				if((k=cache1.search(found[j].parentNode))!=-1) {
					ee0 = cache2[k];
					cc0 = cache3[k]+1;
				} else {
					ee0 = null;
					cc0 = 1;
				}
				for(var sib=found[j]; (sib=previousSibling(sib))!=ee0; ++cc0) {}
				if((cc0-c0)%c1==0 && (cc0-c0)/c1>=0) {
					elems.push(found[j]);
				}
				if(k!=-1) {
					cache2[k] = found[j];
					cache3[k] = cc0;
				} else {
					cache1.push(found[j].parentNode);
					cache2.push(found[j]);
					cache3.push(cc0);
				}
			}
			return elems;
		};
		
		//Selector function
		$ = function(selector, context) {
			
			var elems = new $$();
			
			//Empty selector
			if(!selector) {
				return elems;
			//$$ object
			} else if(selector.concat2) {
				return selector.slice(0);
			//Array
			} else if(selector.push) {
				$$.prototype.push.apply(elems,selector);
				return elems;
			//NodeList
			} else if(selector.item) {
				for(var i=selector.length; i--; elems.unshift(selector[i])) {}
				return elems;
			//DOM element
			} else if(!selector.concat) {
				return $$(selector);
			}
			
			//Selector string
			if(context) {
				context = $(context);
			}
			//Select by commas
			for(var parts=selector.split(r.comma), i=0, l=parts.length; i<l; ++i) {
				elems.concat2(select(parts[i], context));
			}
			if(selector.indexOf(',')!=-1) {
				//todo: fix sort order
				//todo: make faster
				elems.unique();
			}
			return elems;
		};
		//Selector function (no comma separations)
		var select = function(selector, parents) {
			if(!parents) {
				parents = new $$(document);
			} else if(!parents.push) {
				parents = new $$(parents);
			}
			
			//Separate by whitespace
			for(var i=0, parts=selector.split(r.white), l=parts.length; i<l; ++i) {
				if(!parts[i]) {
					continue;
				}
				
				var elems;
				var found = parts[i].length;
				var foundTest = null;
				//Get last sequence separator
				while((found=Math.max(parts[i].lastIndexOf('>',found-1),
										parts[i].lastIndexOf('+',found-1),
										parts[i].lastIndexOf('~',found-1)))!=-1 &&
							parts[i].length>found+1 && r.digeq.test(parts[i][found+1])) {}
				if(found!=-1) {
					elems = new $$();
					if(found) {
						parents = select(parts[i].substr(0,found),parents);
						if(!parents.length) {
							return parents;
						}
					}
					if(parts[i].length==found+1) {
						parts[i+1] = parts[i][found]+parts[i+1];
						continue;
					}
					
					//Prepare for parent-child
					if(parts[i][found]=='>') {
						for(var childs, j=0,lj=parents.length; j<lj;) {
							if(childs=firstChild(parents[j++])) {
								do {
									elems.push(childs);
								} while(childs=nextSibling(childs));
							}
						}
					
					//Prepare for next-sibling
					} else if(parts[i][found]=='+') {
						for(var childs, j=0,lj=parents.length; j<lj;) {
							if(childs=nextSibling(parents[j++])) {
								elems.push(childs);
							}
						}
					
					//Prepare for next-siblings
					//todo: contains should be called only on first pass?
					} else if(parts[i][found]=='~') {
						for(var childs,j=0,lj=parents.length; j<lj;) {
							childs=parents[j++];
							if(elems.contains(childs)) {
								continue;
							}
							while(childs=nextSibling(childs)) {
								elems.push(childs);
							}
						}
					}
				}
				
				if(!(parents=select2(parts[i].substr(found+1),parents,elems)).length) {
					return parents;
				}
			}
			return parents;
		};
		
		var select2 = function(selector,parents,found) {
			var check, elems;
			
			//Select by star
			if(selector[0]=='*') {
				found = found || getter(parents, getByTags, '*');
				selector = selector.substr(1);
				if(!selector) {
					return found;
				}
			}

			
			if(!found) {
				found = new $$();
			}
			
			//Select by id
			if((check=selector.match(r.id)) && !inNot(selector,selector.search(r.id))) {
				check = check[0].substr(1);
				if(!found.length) {
					if(check=document.getElementById(check)) {
						//var uniquePar = uniqueAscenstors(parents);
						elems = check;
						while(elems=elems.parentNode) {
							//if(uniquePar.contains(elems)) {
							if(parents.contains(elems)) {
								found.push(check);
								break;
							}
						}
					}
					
					if(!found.length) {
						return found;
					}
				} else {
					elems = new $$();
					for(var j=0,lj=found.length; j<lj; ++j) {
						if(found[j].id==check) {
							elems.push(found[j]);
							break;
						}
					}
					
					if(!elems.length) {
						return elems;
					}
					found = elems;
				}
			}
			
			//Select by class
			if(check=selector.match(r.className)) {
				for(var k=0,lk=check.length; k<lk; ++k) {
					var index = -1;
					for(var m=0; m<=k; ++m) {
						index = selector.search(r.className,index+1);
					}
					if(!inNot(selector,index)) {
						var checker = check[k].substr(1);
						if(!found.length) {
							if(!(found=getter(parents, getByClass, checker)).length) {
								return found;
							}
						} else {
							elems = new $$();
							checker = new RegExp('(^|\\s)'+checker+'(\\s|$)','i');
							for(var j=0,lj=found.length; j<lj; ++j) {
								if(checker.test(found[j].className)) {
									elems.push(found[j]);
								}
							}
							
							if(!elems.length) {
								return elems;
							}
							found = elems;
						}
					}
				}
			}
			
			//Select by tag
			if(check=selector.match(r.tag)) {
				if(!found.length) {
					if(!(found=getter(parents, getByTags, check[0])).length) {
						return found;
					}
				} else {
					elems = new $$();
					check = check[0].toUpperCase();
					for(var k=0, lk=found.length; k<lk; ++k) {
						if(check==found[k].tagName) {
							elems.push(found[k]);
						}
					}
					found = elems;
				}
				
				if(!found.length) {
					return found;
				}
			}
			
			//Select by attrs
			if(check=selector.match(r.attr)) {
				if(!found.length) {
					if(!(found=getter(parents, getByTags, '*')).length) {
						return found;
					}
				}
				for(var op, j=0, lj=check.length; j<lj; ++j) {
					//todo: optimise duplicated code
					check[j] = check[j].match(r.word).concat(op=check[j].match(r.attrEq));
					if(op && check[j].length<3) {
						check[j][2] = check[j][1];
						check[j][1] = '';
					}
					elems = new $$();
					if(!op) {
						for(var k=0,lk=found.length; k<lk; ++k) {
							if(found[k].getAttribute(check[j][0])) {
								elems.push(found[k]);
							}
						}
					} else if(check[j][2][0]=='=') {
						for(var k=0,lk=found.length; k<lk; ++k) {
							if(found[k].getAttribute(check[j][0])==check[j][1]) {
								elems.push(found[k]);
							}
						}
					} else if(check[j][2][0]=='!') {
						for(var k=0,lk=found.length; k<lk; ++k) {
							if(found[k].getAttribute(check[j][0])!=check[j][1]) {
								elems.push(found[k]);
							}
						}
					} else if(check[j][2][0]=='*') {
						var checker = new RegExp(check[j][1]);
						for(var k=0,lk=found.length; k<lk; ++k) {
							if(checker.test(found[k].getAttribute(check[j][0]))) {
								elems.push(found[k]);
							}
						}
					} else if(check[j][2][0]=='~') {
						var checker = new RegExp('(^|\b)'+check[j][1]+'($|\b)');
						for(var k=0,lk=found.length; k<lk; ++k) {
							if(checker.test(found[k].getAttribute(check[j][0]))) {
								elems.push(found[k]);
							}
						}
					} else if(check[j][2][0]=='^') {
						var checker = new RegExp('^'+check[j][1]);
						for(var k=0,lk=found.length; k<lk; ++k) {
							if(checker.test(found[k].getAttribute(check[j][0]))) {
								elems.push(found[k]);
							}
						}
					} else if(check[j][2][0]=='$') {
						var checker = new RegExp(check[j][1]+'$');
						for(var k=0,lk=found.length; k<lk; ++k) {
							if(checker.test(found[k].getAttribute(check[j][0]))) {
								elems.push(found[k]);
							}
						}
					} else if(check[j][2][0]=='|') {
						var checker = new RegExp('^'+check[j][1]+'(-)?$');
						for(var k=0,lk=found.length; k<lk; ++k) {
							if(checker.test(found[k].getAttribute(check[j][0]))) {
								elems.push(found[k]);
							}
						}
					}
					found = elems;
				}
				
				if(!found.length) {
					return found;
				}
			}
			
			//Select by colon
			if(check=selector.match(r.colon)) {
				if(!found.length) {
					if(!(found=getter(parents, getByTags, '*')).length) {
						return found;
					}
				}
				for(var checks=check, q=0, lq=checks.length; q<lq; ++q) {
					check = checks[q];
					var elems = new $$();
					if(check==':button') {
						for(var j=0,lj=found.length; j<lj; ++j) {
							if(found[j].tagName=='BUTTON' || found[j].getAttribute('type')=='button') {
								elems.push(found[j]);
							}
						}
					} else if(check==':checkbox') {
						for(var j=0,lj=found.length; j<lj; ++j) {
							if(found[j].getAttribute('type')=='checkbox') {
								elems.push(found[j]);
							}
						}
					} else if(check==':checked') {
						for(var j=0,lj=found.length; j<lj; ++j) {
							if(found[j].checked) {
								elems.push(found[j]);
							}
						}
					} else if(check.indexOf(':contains(')!=-1) {
						check = check.substring(10,check.length-1);
						for(var j=0,lj=found.length; j<lj; ++j) {
							if((found[j].textContent||found[j].innerText||found[j].innerHTML).indexOf(check)!=-1) {
								elems.push(found[j]);
							}
						}
					} else if(check==':disabled') {
						for(var j=0,lj=found.length; j<lj; ++j) {
							if(found[j].disabled) {
								elems.push(found[j]);
							}
						}
					} else if(check==':empty') {
						for(var j=0,lj=found.length; j<lj; ++j) {
							if(!found[j].childNodes.length) {
								elems.push(found[j]);
							}
						}
					} else if(check==':enabled') {
						for(var j=0,lj=found.length; j<lj; ++j) {
							if(!found[j].disabled) {
								elems.push(found[j]);
							}
						}
					} else if(check.indexOf(':eq(')!=-1) {
						if((check=parseInt(check.substring(4,check.length-1)))<found.length) {
							elems.push(found[check]);
						} else {
							return new $$();
						}
					} else if(check==':even' || check==':nth-child(even)') {
						elems = nth('2n',found);
					} else if(check==':file') {
						for(var j=0,lj=found.length; j<lj; ++j) {
							if(found[j].getAttribute('type')=='file') {
								elems.push(found[j]);
							}
						}
					} else if(check==':first-child') {
						var cache;
						for(var j=0,lj=found.length; j<lj; ++j) {
							if(cache==found[j].parentNode) {
								continue;
							}
							cache = found[j].parentNode;
							if(found[j]==firstChild(cache)) {
								elems.push(found[j]);
							}
						}
					} else if(check==':first') {
						if(found.length) {
							elems.push(found[0]);
						} else {
							return found;
						}
					} else if(check.indexOf(':gt(')!=-1) {
						elems = found.slice(1+parseInt(check.substring(4,check.length-1)));
					} else if(check==':header') {
						for(var j=0,lj=found.length; j<lj; ++j) {
							if(r.header.test(found[j].tagName)) {
								elems.push(found[j]);
							}
						}
					} else if(check==':hidden') {
						for(var fChild,j=0,lj=found.length; j<lj; ++j) {
							fChild = found[j];
							do {
								eStyle = getComputedStyle(fChild,null);
								if((eStyle.height=='0px' && eStyle.width=='0px') ||
										fChild.getAttribute('type')=='hidden' ||
														eStyle.display=='none') {
									elems.push(found[j]);
									break;
								}
							} while(fChild=fChild.parentNode);
						}
					} else if(check==':image') {
						for(var j=0,lj=found.length; j<lj; ++j) {
							if(found[j].getAttribute('type')=='image') {
								elems.push(found[j]);
							}
						}
					} else if(check==':input') {
						for(var j=0,lj=found.length; j<lj; ++j) {
							if(found[j].tagName=='INPUT' || found[j].tagName=='TEXTAREA' ||
									found[j].tagName=='SELECT' || found[j].tagName=='BUTTON') {
								elems.push(found[j]);
							}
						}
					} else if(check==':last-child') {
						var cache;
						for(var j=found.length; j--;) {
							if(cache==found[j].parentNode) {
								continue;
							}
							cache = found[j].parentNode;
							if(found[j]==lastChild(cache)) {
								elems.unshift(found[j]);
							}
						}
					} else if(check==':last') {
						if(found.length) {
							elems.push(found[found.length-1]);
						} else {
							return found;
						}
					} else if(check.indexOf(':lt(')!=-1) {
						elems = found.slice(0,parseInt(check.substring(4,check.length-1)));
					} else if(check.indexOf(':not(')!=-1) {
						check = select2(check.substring(5,check.length-1), parents, found);
						for(var j=0, lj=found.length; j<lj; ++j) {
							if(!check.contains(found[j])) {
								elems.push(found[j]);
							}
						}
					} else if(check==':odd' || check==':nth-child(odd)') {
						elems = nth('2n+1',found);
					} else if(check.indexOf(':nth-child(')!=-1) {
						elems = nth(check.substring(11,check.length-1),found);
					} else if(check==':only-child') {
						var cache;
						for(var j=0,lj=found.length; j<lj; ++j) {
							if(cache==found[j].parentNode) {
								continue;
							}
							cache = found[j].parentNode;
							if(found[j]==firstChild(cache) && found[j]==lastChild(cache)) {
								elems.push(found[j]);
							}
						}
					} else if(check==':parent') {
						for(var j=0,lj=found.length; j<lj; ++j) {
							if(found[j].childNodes.length) {
								elems.push(found[j]);
							}
						}
					} else if(check==':password') {
						for(var j=0,lj=found.length; j<lj; ++j) {
							if(found[j].getAttribute('type')=='password') {
								elems.push(found[j]);
							}
						}
					} else if(check==':radio') {
						for(var j=0,lj=found.length; j<lj; ++j) {
							if(found[j].getAttribute('type')=='radio') {
								elems.push(found[j]);
							}
						}
					} else if(check==':reset') {
						for(var j=0,lj=found.length; j<lj; ++j) {
							if(found[j].getAttribute('type')=='reset') {
								elems.push(found[j]);
							}
						}
					} else if(check==':selected') {
						for(var j=0,lj=found.length; j<lj; ++j) {
							if(found[j].selected) {
								elems.push(found[j]);
							}
						}
					} else if(check==':submit') {
						for(var j=0,lj=found.length; j<lj; ++j) {
							if(found[j].getAttribute('type')=='submit') {
								elems.push(found[j]);
							}
						}
					} else if(check==':text') {
						for(var j=0,lj=found.length; j<lj; ++j) {
							if(found[j].getAttribute('type')=='text') {
								elems.push(found[j]);
							}
						}
					} else if(check==':visible') {
						for(var fChild,j=0,lj=found.length; j<lj; ++j) {
							fChild = found[j];
							do {
								eStyle = getComputedStyle(fChild,null);
								if((eStyle.height=='0px' && eStyle.width=='0px') ||
										fChild.getAttribute('type')=='hidden' ||
														eStyle.display=='none') {
									break;
								}
							} while(fChild=fChild.parentNode);
							if(!fChild) {
								elems.push(found[j]);
							}
						}
					}
					if(elems.length) {
						found = elems;
					} else {
						return elems;
					}
				}
			}
			
			return found;
		};
	}
	$$.prototype.find = function(selector) {
		return $(selector,this);
	};
	$$.prototype.children = function(selector) {
		var elems = new $$();
		for(var childs,i=0,l=this.length; i<l;) {
			if(childs=firstChild(parents[i++])) {
				do {
					elems.push(childs);
				} while(childs=nextSibling(childs));
			}
		}
		if(selector) {
			elems = select2(selector,this,elems);
		}
		return elems;
	};
	/*
	var ANIMRATE = 30;
	var div = document.createElement('div');
	div.setAttribute('style','transition:opacity 1s;-webkit-transition:opacity 1s;'+
								'-moz-transition:opacity 1s;-o-transition:opacity 1s');
	var cssTransitions = !!(div.style.transition	||div.style.webkitTransition||
							div.style.MozTransition	||div.style.OTransition		);
	delete div;
	
	$$.prototype.each = function(fn) {
		for(var i=0, l=this.length; i!=l; fn.call(this[i++]));
		return this;
	};
	
	$$.prototype.fade = function(rate, callBack, opacity) {
		rate = rate || 1000;
		this.each(function() {
			var elem = this;
			var elemStyle = getComputedStyle(elem,null);
			if(opacity==-1)
				opacity = (elemStyle.display=='none')?1:0;
			elem.style.display = 'inherit';
			if(opacity) elem.style.opacity = 0;
			else elem.style.opacity = 1;
			if(cssTransitions) {
				setTimeout(function() {
					elem.style.transition =
					elem.style.OTransition =
					elem.style.MozTransition =
					elem.style.webkitTransition = 'opacity '+rate/1000+'s linear';
					elem.style.opacity = opacity;
				},0);
			} else {
				if(opacity) {
					var i = 0;
					var rate2 = rate*opacity;
				} else {
					var i = -rate;
					var rate2 = -rate;
				}
				var anim = setInterval(function() {
					elem.style.opacity = (i+=ANIMRATE)/rate2;
				}, ANIMRATE);
			}
			setTimeout(function() {
				if(cssTransitions) {
					elem.style.transition =
					elem.style.OTransition =
					elem.style.MozTransition =
					elem.style.webkitTransition = '';
				} else clearInterval(anim);
				if(!opacity) elem.style.display = 'none';
				else elem.style.opacity = opacity;
				callBack && callBack.call(elem);
			}, rate);
		});
		return this;
	};
	
	$$.prototype.fadeIn = function(rate, callBack) {
		return this.fade(rate, callBack, 1);
	};
	
	$$.prototype.fadeOut = function(rate, callBack) {
		return this.fade(rate, callBack, 0);
	};
	
	$$.prototype.fadeToggle = function(rate, callBack) {
		return this.fade(rate, callBack, -1);
	};
	
	$$.prototype.slide = function(rate, callBack, height) {
		rate = rate || 1000;
		this.each(function() {
			var elem = this;
			var elemStyle = getComputedStyle(elem,null);
			if(height==-1)
				height = (elemStyle.display=='none')?1:0;
			var oldHeight = parseInt(elemStyle.height)||elem._height;
			var oldFlow = elemStyle.overflow;
			if(height) elem.style.height = 0;
			if(elemStyle.display=='none') elem.style.display = 'inherit';
			elem.style.overflow = 'hidden';
			if(cssTransitions) {
				setTimeout(function() {
					elem.style.transition =
					elem.style.OTransition =
					elem.style.MozTransition =
					elem.style.webkitTransition = 'height '+rate/1000+'s linear';
					elem.style.height = ((height)?oldHeight:0)+'px';
				},0);
			} else {
				if(height) {
					var i = 0;
					var inc = oldHeight*ANIMRATE/rate;
				} else {
					var i = oldHeight;
					var inc = -oldHeight*ANIMRATE/rate;
				}
				var anim = setInterval(function() {
					elem.style.height = (i+=inc)+'px';
				}, ANIMRATE);
			}
			setTimeout(function() {
				if(cssTransitions) {
					elem.style.transition =
					elem.style.OTransition =
					elem.style.MozTransition =
					elem.style.webkitTransition = '';
				} else {
					clearInterval(anim);
					elem.style.height = oldHeight+'px';
				}
				if(!height) {
					elem.style.display = 'none';
					elem.style.height = oldHeight+'px';
					elem._height = oldHeight;
				}
				elem.style.overflow = oldFlow;
				callBack && callBack.call(elem);
			}, rate);
		});
		return this;
	};
	*/
	$.$$ = $$, window.$ = $;
})();
