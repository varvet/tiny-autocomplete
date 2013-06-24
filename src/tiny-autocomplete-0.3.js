/*!
  The MIT License (MIT)
  Copyright © 2013 Johan Halse
  https://twitter.com/hejsna
  <johan@varvet.se>
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
  THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * Tiny Autocomplete
 * @return {object}         Self
 */
(function(window, $) {
  var TinyAutocomplete = function(el, options){
    this.field = $(el);
    this.el = null;
    this.json = null;
    this.items = [];
    this.selectedItem = null;
    this.list = $('<ul class="autocomplete-list" />');
    this.lastSearch = null;
    this.options = options;
  };

  TinyAutocomplete.prototype = {
    defaults: {
      minChars: 2,
      markAsBold: true,
      grouped: false,
      queryProperty: 'q',
      method: 'get',
      lastItemTemplate: null,
      groupContentName: '.autocomplete-items',
      groupTemplate: '<li class="autocomplete-group"><span class="autocomplete-group-header">{{title}}</span><ul class="autocomplete-items" /></li>',
      itemTemplate: '<li class="autocomplete-item">{{title}}</li>'
    },

    /**
     * Constructor
     * @return {null}
     */
    init: function() {
      this.settings = $.extend({}, this.defaults, this.options);
      this.setupMarkup();
      this.setupEvents();

      return this;
    },

    /**
     * Micro-templating utility
     * @param  {string} template Template string with mustache-style curly braces
     * @param  {object} vars     Contains values to interpolate with
     * @return {string}          Interpolated string
     */
    template: function(template, vars) {
      return template.replace(/{{\s*[\w]+\s*}}/g, function(v) {
        return vars[v.substr(2,v.length-4)];
      });
    },

    /**
     * Register initial mousedown callback
     * @return {null}
     */
    setupEvents: function() {
      this.el.on('keyup', '.autocomplete-field', $.proxy(this.onKeyUp, this));
      this.el.on('keydown', '.autocomplete-field', $.proxy(this.onKeyDown, this));
      this.el.on('click', '.autocomplete-item', $.proxy(this.onClickItem, this));
    },

    /**
     * Wrap field in required markup and set up this.el
     * @return {null}
     */
    setupMarkup: function() {
      this.field.addClass('autocomplete-field');
      this.field.wrap('<div class="autocomplete" />');
      this.el = this.field.parent();
    },

    /**
     * Fire request to specified url
     * @param  {string} val Value to search for
     * @return {null}
     */
    request: function(val) {
      var data = {};
      data[this.settings.queryProperty] = val;
      $.ajax({
        method: this.settings.method,
        url: this.settings.url,
        dataType: 'json',
        data: data,
        success: $.proxy(this.onReceiveData, this)
      });
    },

    /**
     * Find DOM object at specified index
     * @param  {number} i Index
     * @return {object}   jQuery object
     */
    itemAt: function(i) {
      return $('.autocomplete-item').eq(i);
    },

    /**
     * Find item number for clicked item
     * @param  {object} o The clicked object
     * @return {number}   Item's id in array
     */
    clickedItemAt: function(o) {
      for(var i=0;i<this.items.length;i++) {
        if(o == this.el.find('.autocomplete-item').eq(i).get(0)) {
          return i;
        }
      }
      return null;
    },

    /**
     * Select previous item
     * @return {null}
     */
    prevItem: function() {
      this.selectedItem--;
      if(this.selectedItem < 0) {
        this.selectedItem = null;
      }

      this.markSelected( this.selectedItem );
    },

    /**
     * Select next item
     * @return {null}
     */
    nextItem: function() {
      if(this.selectedItem == null) {
        this.selectedItem = -1;
      }
      this.selectedItem++;

      var l = (this.settings.lastItemTemplate) ? this.items.length : this.items.length-1;
      if(this.selectedItem >= l) {
        this.selectedItem = l;
      }

      this.markSelected( this.selectedItem );
    },

    /**
     * Mark an item as selected
     * @param  {number} i Item's id in items array
     * @return {null}
     */
    markSelected: function(i) {
      this.el.find('.active').removeClass('active');
      this.itemAt( i ).addClass('active');
    },

    /**
     * Iterate through data, adding <strong> tags for every hit
     * @param  {object} v   Data to operate on
     * @param  {string} str String to search for
     * @return {object}     Processed data object
     */
    markHitText: function(v, str) {
      for(var i in v) {
        if(typeof(v[i]) == 'string' && i != 'template') {
          v[i] = v[i].replace( new RegExp("(" + str + ")" , 'gi'), "<strong>$1</strong>" );          
        }
      }
      return v;
    },

    /**
     * Render groups. This must be done before calling
     * renderItemsInGroups, since it resets the list markup and
     * attaches a new this.list object.
     * @return {null}
     */
    renderGroups: function() {
      this.list.remove();
      this.list = $('<ul class="autocomplete-list" />');
      for(var i in this.json) {
        this.list.append( this.template( this.settings.groupTemplate, this.json[i] ) );
      }

      this.el.append( this.list );
    },

    /**
     * Iterates through items and attaches them to their respective
     * groups.
     * @return {null}
     */
    renderItemsInGroups: function() {
      var v = this.field.val();
      for(var i in this.json) {
        var group = this.el.find( this.settings.groupContentName ).eq(i);
        for(var j in this.json[i].data) {
          var jsonData = $.extend({}, this.json[i].data[j]);
          // Strongify hits
          if(this.settings.markAsBold) {
            jsonData = this.markHitText( jsonData, v )
          }
          group.append( this.template( this.json[i].template || this.settings.itemTemplate, jsonData ) );
        }
      }
    },

    /**
     * If we're not dealing with groups, just attach items to the list.
     * @return {null}
     */
    renderItemsFlat: function() {
      this.list.remove();
      this.list = $('<ul class="autocomplete-list" />');
      var v = this.field.val();
      for(var i in this.json) {
        var jsonData = $.extend({}, this.json[i]);
        // Strongify hits
        if(this.settings.markAsBold) {
          jsonData = this.markHitText( jsonData, v )
        }
        this.list.append( this.template( this.json[i].template || this.settings.itemTemplate, jsonData ) );
      }      
      this.el.append( this.list );
    },

    /**
     * If there's a last "find all results for..." item, this function
     * gets called.
     * @return {null}
     */
    renderLastItem: function() {
      this.list.append( this.template( this.settings.lastItemTemplate, {title: this.field.val()} ) );
    },

    /**
     * Removes list from DOM and resets state.
     * @return {null}
     */
    closeList: function() {
      $('.main').off('click');
      this.list.remove();
      this.selectedItem = null;
    },

    /**
     * Since groups aren't selectable, we need to fetch the actual
     * selectable items and keep them around in our this.items list.
     * @return {array} List of selectable items
     */
    getItemsFromGroups: function() {
      var r = [];
      for(var i in this.json) {
        for(var j in this.json[i].data) {
          r.push(this.json[i].data[j]);
        }
      }

      return r;
    },

    /**
     * Check whether a value has changed. Used to determine whether or
     * not we fire a new request, since all keypresses generate an
     * event.
     * @return {boolean} True if value has changed since last request
     */
    valueHasChanged: function() {
      if(this.field.val() != this.lastSearch) {
        this.lastSearch = this.field.val();
        return true;
      }
      return false;
    },

    /**
     * Data received from server, determine what to do with it and
     * render everything.
     * @param  {object} data JSON from server
     * @param  {object} xhr  jQuery XHR object
     * @return {null}
     */
    onReceiveData: function(data, xhr) {
      this.selectedItem = null;
      this.json = data;
      if(this.settings.grouped) {
        // First, render groups
        this.renderGroups();

        // Then, render the selectable items
        this.items = this.getItemsFromGroups();
        this.renderItemsInGroups();
      }
      else {
        this.items = this.json;
        this.renderItemsFlat();
      }

      // Render last item, if applicable
      if(this.settings.lastItemTemplate) {
        this.renderLastItem();
      }

      // Click outside should close the list
      $('.main').one('click', $.proxy(this.closeList, this));
    },

    /**
     * Keyup handler that checks whether or not to fire a request to
     * server.
     * @param  {object} e Normalized jQuery event object
     * @return {null}
     */
    onKeyUp: function(e) {
      if(this.field.val().length >= this.settings.minChars && this.valueHasChanged()) {
        this.request( this.field.val() );
      }
      if(this.field.val() == '') {
        this.closeList();
      }
    },

    /**
     * Keydown handler to take care of keyboard navigation.
     * @param  {object} e Normalized jQuery event object
     * @return {null}
     */
    onKeyDown: function(e) {
      if(e.keyCode == 38) {  // Up
        e.preventDefault();
        this.prevItem();
      }
      if(e.keyCode == 40) {  // Down
        e.preventDefault();
        this.nextItem();
      }
      if(e.keyCode == 13) {  // Enter
        e.preventDefault();
        this.onPressEnter();
      }
      if(e.keyCode == 27) {  // Esc
        e.preventDefault();
        this.closeList();
      }
    },

    /**
     * Click handler, handle mouse/touch selection of items.
     * @param  {object} e Normalized jQuery event object
     * @return {null}
     */
    onClickItem: function(e) {
      var i = this.clickedItemAt(e.currentTarget);
      this.onSelect(e.currentTarget, this.items[i]);
    },

    /**
     * User has pressed enter, select object or perform search.
     * @return {null}
     */
    onPressEnter: function() {
      this.onSelect( this.itemAt( this.selectedItem ), this.items[this.selectedItem] );
    },

    /**
     * User has selected an object with mouse or keyboard - act on it
     * and fire any user-supplied callback.
     * @param  {object} item jQuery object for the field
     * @param  {object} val  Item value from server
     * @return {null}
     */
    onSelect: function(item, val) {
      if(this.settings.onSelect) {
        this.settings.onSelect.apply(this.field, [item, val]);
      }
      this.lastSearch = this.field.val();
      this.closeList();
    }
  };

  TinyAutocomplete.defaults = TinyAutocomplete.prototype.defaults;

  $.fn.tinyAutocomplete = function(settings) {
    return this.each(function() {
      var d = new TinyAutocomplete(this, settings).init();
      this.tinyAutocomplete = {settings: d.settings};
    });
  };

  $.tinyAutocomplete = TinyAutocomplete;
})(window, $);