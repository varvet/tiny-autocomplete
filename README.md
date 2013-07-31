# Tiny Autocomplete
A small and snappy (2k minified+gzipped!) JavaScript autocomplete plugin for Zepto and jQuery.

## Why?
Because it seems the only great autocomplete plugin out there is the jQuery UI one. It's a lovely plugin, both good-looking and robust, but it also requires you to pull in >100k of JavaScript and some 20k of CSS which makes it a non-starter for most projects, unless you're already using the jQuery UI components. And it doesn't support mobile or tablets! So the aim of Tiny Autocomplete is to make a plugin that's
* Small footprint
* Fast
* Compatible with both Zepto and jQuery
* Working on tablets and mobile devices

Tiny Autocomplete also tries to be extendable. There's no abuse of closures or effort to make things private within the plugin, so if you want to monkey patch a built-in function, change a setting at runtime, or build a plugin for it - go right ahead!

## Data and templating
Tiny Autocomplete is a little picky with its JSON formatting. You can either just supply it with an array of objects (and those can contain arbitrary data), or you can feed it an array of groups. The grouped array items need a property called "data" that contains the array of objects instead. It's probably easiest to look at the local data examples if you need help. It's pretty straightforward. If you don't have control over your data source, you can overwrite the `onReceiveData` callback with something hand-rolled instead.

Tiny Autocomplete also doesn't really assume it knows what your markup wants to look like. There's a built-in default but there's also a micro-templating engine in there which sounds kind of ominous but is actually really nifty. Since you can supply Tiny Autocomplete with your own little mustache-like template string, there's no magic "name" or "id" attribute or whatever. You can feed it a thumbnail, an icon, 5 levels of `<div>` wrapping - the sky's the limit.

Note: while you can use Tiny Autocomplete with a local data source, the pattern matching implementation is quite naïve. Intelligently searching through a result set and returning it is what servers do really well, so maybe that's what you want to do?

## Demos
[Flat search with local data]

[Grouped search with local data]

[Flat search with remote data]

[Grouped search with remote data]

## Installation
Just include tiny-autocomplete-0.x.js (development) or tiny-autocomplete-0.x-min.js (production) after Zepto or jQuery. Include tiny-autocomplete.css and you're good to go!

## Usage
### Initialize an autocomplete field
```javascript
$('.autocomplete').tinyAutocomplete({ /* settings */ });
```


### Settings
#### url:
```javascript
$('.autocomplete').tinyAutocomplete({ url:'http://www.example.com/search' });
```
The url to run search queries against.


#### data:
```javascript
$('.autocomplete').tinyAutocomplete({ data:[...] });
```
The formatted JSON data, either a flat array or a grouped one. Tiny Autocomplete will search *all* the fields in your data and return the items where it found a match.


#### method:
```javascript
$('.autocomplete').tinyAutocomplete({ method:'post' });
```
Method to use - defaults to `get` but you can change it to `post`.


#### onSelect:
```javascript
$('.autocomplete').tinyAutocomplete({ onSelect:function(el, val){...} });
```
This is the method that fires when user has selected an option in the autocomplete list, and it's scoped to the field the user is typing in. You get to decide what to do with the information - possibly load data via AJAX or redirect the user to the selected object's page or something even more clever. If user has just pressed enter without selecting an object, or has selected the lastItemTemplate object, the `val` argument will be blank and you should act on $(this).val() instead. Maybe go to the full search page?


#### minChars:
```javascript
$('.autocomplete').tinyAutocomplete({ minChars:3 });
```
Minimum number of characters user has to type before autocomplete kicks in. Defaults to `2`.


#### scrollOnFocus:
```javascript
$('.autocomplete').tinyAutocomplete({ scrollOnFocus:true });
```
For vertically-challenged touch devices that pop up an on-screen keyboard, it's a good idea to scroll the search field to the top. Tiny Autocomplete tries to guess if it's needed, but you might have a more intelligent heuristic. Then use that to set scrollOnFocus.


#### keyboardDelay:
```javascript
$('.autocomplete').tinyAutocomplete({ keyboardDelay:400 });
```
The delay between user releasing the key and search being performed. Set this high to avoid firing lots of requests while the user is typing, or low for more responsiveness. Defaults to `200` and can be set to `null` to bypass it altogether.


#### timeLimit:
```javascript
$('.autocomplete').tinyAutocomplete({ timeLimit:1000 });
```
Maximum amount of searches allowed in a given time frame. The last search is queued up and will fire as soon as it's allowed to do so.


#### queryProperty:
```javascript
$('.autocomplete').tinyAutocomplete({ queryProperty:'term' });
```
The name of the request property to send in GET or POST request. Defaults to `q`.


#### markAsBold:
```javascript
$('.autocomplete').tinyAutocomplete({ markAsBold:false });
```
Compare the result set with the typed string and wrap any matches in a `<strong />` tag. Processes all the properties in the matched JSON object. Defaults to `true`.


#### grouped:
```javascript
$('.autocomplete').tinyAutocomplete({ grouped:true });
```
Whether or not Tiny Autocomplete should render the JSON as a grouped list. If set to false, it will expect a simple array of objects, if set to true it will expect the first-level objects to have a "data" property containing an array instead:
```javascript
[
  {
    "title": "Larks",
    "coolness": "awesome",
    "data": [
      {"title":"Clapper Lark", "sound":"warbling" ...},
      {"title":"Spike-heeled Lark", "weight":5 ...}
  }
]
```


#### itemTemplate:
```javascript
$('.autocomplete').tinyAutocomplete({ itemTemplate:'<li class="autocomplete-item">{{id}}: {{title}}</li>' });
```
Template for an item, using a pseudo-mustache engine. Objects will be passed to the template and it will perform string interpolation, replacing the {{mustachioed}} values with those from the object. For advanced usage, this can be overridden from the JSON-data on a per-group basis, like this:
```javascript
[
  {
    "title": "Larks",
    "template": "<li class='autocomplete-item LARK-ITEM'>Lark: {{title}}</li>",
    "data": [
      {"title":"Clapper Lark"},
      {"title":"Spike-heeled Lark"}
  }
]
```
Default template for an item is `<li class="autocomplete-item">{{title}}</li>`.


#### groupTemplate:
```javascript
$('.autocomplete').tinyAutocomplete({ groupTemplate:'<li class="autocomplete-group"><h2>{{title}}</h2><ul class="autocomplete-items" /></li>' });
```
Change template for an item group, when using grouped view. Default is `<li class="autocomplete-group"><span class="autocomplete-group-header">{{title}}</span><ul class="autocomplete-items" /></li>`. Make sure your `groupContentName` matches the ul class!


#### groupContentName:
```javascript
$('.autocomplete').tinyAutocomplete({ groupContentName: '.my-items'});
```
If you have changed the groupTemplate, you might have to tell Tiny Autocomplete where to put the group's items. Supply it with a class name and it will append the result items there.


#### lastItemTemplate:
```javascript
$('.autocomplete').tinyAutocomplete({ lastItemTemplate: '<li class="autocomplete-item autocomplete-item-last">Show all results for "{{title}}"</li>' });
```
Set this template if you want to display a last item without any data bound to it. The field's current value will be supplied as {{title}}. This is useful for giving users an "all results for X" option at the bottom of the list.


### Global defaults
If you want to, you can set global options for all your autocompletes by setting them on the $.tinyAutocomplete.defaults object, like so:
```javascript
$.tinyAutocomplete.defaults.method = 'post';
```

### Change settings at runtime
Yes, you can do this! But some things are computed at instantiation, such as maxItems.

## License
[MIT]

[Flat search with local data]: http://tiny-autocomplete.hal.se/local.html
[Grouped search with local data]: http://tiny-autocomplete.hal.se/grouped.html
[Flat search with remote data]: http://tiny-autocomplete.hal.se/grouped.html
[Grouped search with remote data]: http://tiny-autocomplete.hal.se
[MIT]: http://johanhalse.mit-license.org