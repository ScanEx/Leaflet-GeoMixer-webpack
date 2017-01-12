L.Control.GmxTree = L.Control.Layers.extend({
    includes: L.Mixin.Events,
    options: {
        collapsed: false,
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
			this._getMap(options.mapID);
		}
    },

    onAdd: function (map) {
        var cont = L.Control.Layers.prototype.onAdd.call(this, map);
        this._container = cont;
        cont.id = this.options.id;

		var tree = this._tree = new InspireTree({
			target: cont,
		  // editable: true,
			contextMenu: true,
			selection: {
				multiple: false,
				mode: 'checkbox'
			},
			data: []
		});
		var _this = this;
        tree
			.on('model.loaded', function() {
				// console.log('dddddddd', arguments);
            })
			.on('node.click', function() {
				// console.log('node.click', arguments);
            }) 
			.on('node.selected', function(treeNode) {
				_this.fire('selected', {treeNode: treeNode});
				// console.log('node.selected', treeNode);
            })
			.on('node.deselected', function(treeNode) {
				_this.fire('deselected', {treeNode: treeNode});
				// console.log('node.deselected', treeNode);
            })
			.on('node.contextmenu', function(ev, node) {
				_this._hideContextMenu();
				if (_this.options.contextMenu) {
					_this.options.contextmenuItems = _this.options.contextMenu({
						originalEvent: ev,
						node: node
					}) || [];
					_this._showContextMenu({originalEvent: ev});
				}
            });

        if (this.options.contextMenu) {
			this.bindContextMenu({
				contextmenu: true,
				contextmenuInheritItems: false,
				contextmenuItems: []
			});
            map.on('mousedown', this._hideContextMenu, this);
        }
        if (map.gmxControlsManager) {
            map.gmxControlsManager.add(this);
        }
        return cont;
    },

    nodeDeselect: function (ev) {
console.log('nodeDeselect', ev);
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
console.log('nodeSelect', node.radio);
			
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
		});
    },

    _getMap: function (id) {
        if (id) {
			var _this = this,
				hostName = L.gmxUtil.normalizeHostname(this.options.hostName || 'maps.kosmosnimki.ru');

			L.gmx.gmxMapManager.getMap(hostName, this.options.apiKey, id, this.options.skipTiles).then(function(res) {
// console.log(res);
				L.gmx.gmxMapManager.iterateNode(res, function(node) {
					// if (node.type === 'group') {
						// iterate(layer.content);
					// } else if (layer.type === 'layer') {
					// }
					var props = node.content.properties;
					node.gmxOptions = {
						dataSource: props.dataSource || '',
						mapID: id
					};
					node.id = props.name || props.GroupID;
					node.text = props.title;
					node.children = node.content.children;
				});
				_this._tree.addNodes(res.children);
				_this._reIndex(true);
				//var layerInfo = L.gmx.gmxMapManager.findLayerInfo(hostName, mapID, layerID);
			});
        }
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
