L.Control.GmxTree = L.Control.extend({
    includes: L.Mixin.Events,
    options: {
        position: 'topright',
        autoZIndex: false,
		contextMenu: false,
        id: 'layersTree'
    },

    initialize: function (options) {
        L.setOptions(this, options);

		this.hostName = 'maps.kosmosnimki.ru';
        this._layers = {};
        this._lastZIndex = 0;
        this._handlingClick = false;

        if (options.mapID) {
			// this._getMap(options.mapID);
		}
    },

    onAdd: function (map) {
		var _this = this,
			pos = this.getPosition(),
			corner = map._controlCorners[pos];

		if (!corner) {
			corner = document.getElementById(pos);
			if (!corner) {
				var arr = document.getElementsByClassName(pos);
				corner = arr.length ? arr[0] : document.getElementById(pos) || map._controlCorners[L.Control.prototype.GmxTree.options.position];
			}
			if (!map._controlCorners[pos]) { map._controlCorners[pos] = corner; }
		}

        var cont = this._container = L.DomUtil.create('div', this.options.className || 'mapTree-container');
        cont.id = this.options.id;

		var tree = this._tree = new InspireTree({
			target: cont,
		  // editable: true,
			contextMenu: true,
			selection: {
				multiple: false,
				mode: 'checkbox'
			},
			dragTargets: [
				cont
			],
			// data: []
			data: function(node, resolve, reject) {
console.log('data', node, resolve, reject);
				_this._getMap(_this.options.mapID);
				// if (!node) {	// основная карта
					// _this._getMap(_this.options.mapID, node);
				// }
				// return $.getJSON('sample-data/' + (node ? node.id : 'root') + '.json');
				return [];
			}
		});
        tree
			.on('model.loaded', function() {
				// console.log('dddddddd', arguments);
            })
			.on('node.click', function() {
				console.log('node.click', arguments);
            })
			.on('node.expanded', function(treeNode) {
				if (treeNode && treeNode.gmxOptions && treeNode.gmxOptions.dataSource) {
					// treeNode.getChildren().forEach(function(node) {node.remove();});
					_this._getMap(treeNode.gmxOptions.dataSource, treeNode);
				}
				_this.fire('expanded', {treeNode: treeNode});
				console.log('node.expanded', treeNode);
            })
			.on('node.selected', function(treeNode) {
				_this.fire('selected', {treeNode: treeNode});
				// console.log('node.selected', treeNode);
            }) 
			.on('node.deselected', function(treeNode) {
				_this.fire('deselected', {treeNode: treeNode});
				// console.log('node.deselected', treeNode);
            })
			.on('node.dropin', function(treeNode) {
				_this.fire('dropin', {treeNode: treeNode});
				console.log('node.dropin', arguments);
            })
			.on('node.dropout', function(treeNode, target, targetIsTree) {
				_this.fire('dropout', {treeNode: treeNode, target: target, targetIsTree: targetIsTree});
                // treeNode.softRemove();
                // var selected = treeNode.selected();

                // if (targetIsTree) {
                    // alert('dropped ' + treeNode.text + ' into another tree');
                // } else {
                    // alert('dropped ' + treeNode.text + ' into a div');
                // }
				console.log('node.dropout', tree.selected(), arguments);
            })
			.on('node.contextmenu', function(ev, node) {
				_this.fire('contextmenu', {originalEvent: ev, treeNode: node}, _this);
				_this._showContextMenu({originalEvent: ev});
            });

		this.bindContextMenu({
			contextmenu: true,
			contextmenuInheritItems: false,
			contextmenuItems: []
		});
		map.on('mousedown', function(ev) {
			this.setContextMenuItems();
			this._hideContextMenu();
		}, this);
        if (map.gmxControlsManager) {
            map.gmxControlsManager.add(this);
        }
        return cont;
    },

    setContextMenuItems: function (arr) {
		this.options.contextmenuItems = arr || [];
    },

    nodeExpanded: function (treeNode) {
console.log('nodeExpanded', treeNode);
		var gmxOptions = treeNode.gmxOptions;
		if (gmxOptions.dataSource) {
			this._getMap(treeNode);
		}
    },

    nodeDeselect: function (ev) {
// console.log('nodeDeselect', ev);
		var node = ev.treeNode,
			layer = node.gmxOptions.layer;
		if (layer && layer._map) {
			layer._map.removeLayer(layer);
		}
		node.content.properties.visible = false;
		return this;
    },

    nodeSelect: function (ev) {
		this._setNodeLayer(ev.treeNode);
		return this;
    },

    _setNodeLayer: function (node) {
		var gmxOptions = node.gmxOptions,
			layer = gmxOptions.layer;
// console.log('nodeSelect', node.radio);
			
		if (layer) {
			if (layer.setZIndexOffset) {
				layer.options.zIndex = gmxOptions.index;
				layer.setZIndexOffset();
			}
			if (this._map) {
				this._map.addLayer(layer);
			}
		} else {
			var _this = this;
			L.gmx.loadLayer(gmxOptions.mapID, node.id, {
				zIndex: gmxOptions.index 
			}).then(function (it) {
				if (_this._map) {
					_this._map.addLayer(it);
				}
				gmxOptions.layer = it;
				return it;
			});
		}
		node.content.properties.visible = true;
		return node;
    },

    _reIndex: function (chkVisible) {
		var count = 0,
			_this = this;

		this._tree.recurseDown(function(node) {
			if (node.gmxOptions) {
				node.gmxOptions.index = ++count;
				var props = node.content.properties;
				if (node.type === 'group') {
					if (props.expanded) {
						node.expand();
					}
					if (!props.ShowCheckbox) {
						node.hide();
					}
				} else if (node.type === 'layer') {
					var pNode = node.getParent();
					if (pNode && pNode.content.properties.list) {
						node.radio = true;
						var arr = node.itree.ref.node.getElementsByTagName('input');
						if (arr) {
							arr[0].setAttribute('name', pNode.id);
							arr[0].setAttribute('type', 'radio');
						}
					}
					if (chkVisible && props.visible) {
						node.select();
					}
				}
			}
		});
    },

    _getMap: function (mapID, treeNode) {
		var _this = this,
			hostName = L.gmxUtil.normalizeHostname(this.options.hostName || 'maps.kosmosnimki.ru');

		L.gmx.gmxMapManager.getMap(hostName, this.options.apiKey, mapID, this.options.skipTiles).then(function(res) {
			L.gmx.gmxMapManager.iterateNode(res, function(node) {
				var props = node.content.properties;
				node.gmxOptions = {
					dataSource: props.dataSource || '',
					mapID: mapID
				};
				node.id = props.name || props.GroupID;
				node.text = props.title;
				node.children = node.content.children;
				if (node.type === 'group' && node.gmxOptions.dataSource) {
					if (props.expanded || props.visible) {
console.log('aaaaaaaa', node.gmxOptions.dataSource);
					} else {
						node.children = true;
						// [
							// {text: 'Extrnal map', mapID: node.gmxOptions.dataSource}
						// ];
					}
					// iterate(layer.content);
				// } else if (layer.type === 'layer') {
				}
			});
			if (treeNode) { treeNode.addChildren(res.children); }
			else { _this._tree.addNodes(res.children); }
			_this._reIndex(true);
			//var layerInfo = L.gmx.gmxMapManager.findLayerInfo(hostName, mapID, layerID);
		});
        return this;
    }
});
L.Control.GmxTree.mergeOptions({
	contextmenu: true,
	contextmenuItems: [],
	contextmenuInheritItems: false
});
L.Control.GmxTree.include(L.Mixin.ContextMenu);
L.Control.GmxTree.addInitHook(function () {
	if (this.options.contextMenu) {
		this._initContextMenu();
	}
});

L.control.gmxTree = function (options) {
  return new L.Control.GmxTree(options);
};
