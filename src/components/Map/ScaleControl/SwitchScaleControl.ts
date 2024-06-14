// This was taken from https://github.com/victorzinho/leaflet-switch-scale-control
// but extracted as require did not seem to work
import * as L from 'leaflet'

export const SwitchScaleControl = L.Control.extend({
  options: {
    position: 'bottomleft',
    dropdownDirection: 'upward',
    className: 'map-control-scalebar',
    updateWhenIdle: true,
    ratio: true,
    ratioPrefix: '1: ',
    ratioCustomItemText: '1: type to set...',
    customScaleTitle: 'Choose Scale',
    ratioMenu: true,

    // If recalcOnZoomChange is false, then recalcOnPositionChange is always false.
    recalcOnPositionChange: true,
    recalcOnZoomChange: true,
    scales: [
      2000, 5000, 10000, 25000, 50000, 100000, 200000, 500000,
      1000000, 2500000, 5000000, 10000000,
    ],
    roundScales: undefined,
    adjustScales: false,

    // Returns pixels per meter; needed if ratio: true.
    pixelsInMeterWidth: function () {
      var div = document.createElement('div')
      div.style.cssText =
        'position: absolute;  left: -100%;  top: -100%;  width: 100cm;'
      document.body.appendChild(div)
      var px = div.offsetWidth
      document.body.removeChild(div)
      return px
    },

    // Returns width of map in meters on specified latitude.
    getMapWidthForLanInMeters: function (currentLan) {
      return 6378137 * 2 * Math.PI * Math.cos((currentLan * Math.PI) / 180)
    },

    render: function (ratio) {
      return '1 : ' + ratio?.toLocaleString('de-ch')
    },
  },

  onAdd: function (map) {
    this._map = map
    this._pixelsInMeterWidth = this.options.pixelsInMeterWidth()

    var className = this.options.className
    var container = L.DomUtil.create(
      'div',
      'leaflet-control-scale ' + className,
    )
    var options = this.options

    this._addScales(options, className, container)

    if (options.recalcOnZoomChange) {
      if (options.recalcOnPositionChange) {
        map.on(options.updateWhenIdle ? 'moveend' : 'move', this._update, this)
      } else {
        map.on(options.updateWhenIdle ? 'zoomend' : 'zoom', this._update, this)
      }
    } else {
      map.on(
        options.updateWhenIdle ? 'zoomend' : 'zoom',
        this._updateRound,
        this,
      )
    }

    map.whenReady(
      options.recalcOnZoomChange ? this._update : this._updateRound,
      this,
    )

    L.DomEvent.disableClickPropagation(container)

    console.log('SwitchScaleControl.onAdd, container:', container)

    return container
  },

  onRemove: function (map) {
    if (this.options.recalcOnZoomChange) {
      if (this.options.recalcOnPositionChange) {
        map.off(
          this.options.updateWhenIdle ? 'moveend' : 'move',
          this._update,
          this,
        )
      } else {
        map.off(
          this.options.updateWhenIdle ? 'zoomend' : 'zoom',
          this._update,
          this,
        )
      }
    } else {
      map.off(
        this.options.updateWhenIdle ? 'zoomend' : 'zoom',
        this._updateRound,
        this,
      )
    }
  },

  _setScale: function (ratio) {
    var map = this._map
    var bounds = map.getBounds()
    var centerLat = bounds.getCenter().lat
    var crsScale =
      (this._pixelsInMeterWidth *
        this.options.getMapWidthForLanInMeters(centerLat)) /
      ratio
    this._map.setZoom(map.options.crs.zoom(crsScale))
    this._toggleDropdown()
  },

  _toggleDropdown: function () {
    var height =
      this.dropdown.style['max-height'] === '0em'
        ? this.options.scales.length * 2
        : 0
    this.dropdown.style['max-height'] = height + 'em'
    this.dropdown.style.border = height ? null : '0'
  },

  _addScale(ratio) {
    var menuitem = L.DomUtil.create(
      'div',
      this.options.className + '-scale-item',
      this.dropdown,
    )
    menuitem.innerHTML = this.options.render(ratio)
    var setScale = this._setScale.bind(this)
    menuitem.addEventListener('click', function () {
      setScale(ratio)
    })
  },

  _addScales: function (options, className, container) {
    if (!options.ratio) return

    if (options.ratioMenu) {
      this.dropdown = L.DomUtil.create(
        'div',
        className + '-dropdown',
        container,
      )
      this._toggleDropdown()
    }
    this.text = L.DomUtil.create('div', className + '-text', container)

    if (!options.ratioMenu) return

    var _this = this
    var scales = options.scales

    this.text.addEventListener('click', this._toggleDropdown.bind(_this))

    scales.forEach(this._addScale.bind(this))

    // deactivated customScaleInput because: not working as expected
  },

  _updateRound: function () {
    this._updateFunction(true)
  },

  _update: function () {
    this._updateFunction(false)
  },

  _updateFunction: function (isRound) {
    if (this._map.getSize().x > 0 && this.options.ratio) {
      var bounds = this._map.getBounds()
      var centerLat = bounds.getCenter().lat
      var mapWidth = this.options.getMapWidthForLanInMeters(centerLat)
      var ratio =
        (this._pixelsInMeterWidth * mapWidth) /
        this._map.options.crs.scale(this._map.getZoom())
      this._updateRatio(ratio, isRound)
    }
  },

  _updateRatio: function (physicalScaleRatio, isRound) {
    var scaleText = isRound
      ? this._roundScale(physicalScaleRatio)
      : Math.round(physicalScaleRatio)
    this.text.innerHTML = this.options.render.call(this, scaleText)
  },

  _roundScale: function (physicalScaleRatio) {
    var scales = this.options.roundScales || this.options.scales

    if (physicalScaleRatio < scales[0]) {
      return scales[0]
    }

    if (physicalScaleRatio > scales[scales.length - 1]) {
      return scales[scales.length - 1]
    }

    for (var i = 0; i < scales.length - 1; i++) {
      if (
        physicalScaleRatio < scales[i + 1] &&
        physicalScaleRatio >= scales[i]
      ) {
        return scales[i + 1] + scales[i] - 2 * physicalScaleRatio >= 0
          ? scales[i]
          : scales[i + 1]
      }
    }

    return Math.round(physicalScaleRatio)
  },
})
