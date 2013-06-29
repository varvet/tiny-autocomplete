# Tiny Autocomplete
A small and snappy (less than 2k minified+gzipped!) JavaScript autocomplete plugin for Zepto and jQuery.

## Why?
Because it seems the only decent autocomplete plugin out there is the jQuery UI one. It's a lovely plugin, both good-looking and robust, but it also requires you to pull in >100k of JavaScript and some 20k of CSS which makes it a non-starter for most projects, unless you're already using the jQuery UI components. And it doesn't support mobile or tablets. So the aim of Tiny Autocomplete is to make a plugin that's
* Small
* Fast
* Compatible with both Zepto and jQuery
* Working on tablets and mobile devices

Touch support and responsive is still in the works. But it has already seen some action on desktop sites, and we'll get there!

## Philosophy
Tiny Autocomplete doesn't support client-side filtering. The goal of an autocomplete is to quickly access search results from a larger result set as you type, and unless your set is super small, the server is going to do a far better job than the browser - especially when computational power is at a premium, like on mobile. So Tiny Autocomplete doesn't support local data sources, and likely never will. It's also going to be a little picky with what kind of data it accepts - some variation is acceptable, if for instance your result set has "name" instead of "title" then that's fine, but building an autocomplete plugin that accepts all kinds of data is going to result in a bloated, hard-to-understand mess. So Tiny Autocomplete assumes that you have control over your result set and can adapt to its needs.

But where data is tightly controlled, the templating shouldn't be! Tiny Autocomplete should support changing the default templates around. Then we'll have a small plugin with good freedom to modify and change things around.


## Demos
[Grouped search]

[Flat search]

## Installation
Just include tiny-autocomplete-0.x.js (development) or tiny-autocomplete-0.x-min.js (production) after Zepto or jQuery. You're good to go!

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


#### method:
```javascript
$('.autocomplete').tinyAutocomplete({ method:'post' });
```
Method to use - defaults to `get` but you can change it to `post`.


#### onSelect:
```javascript
$('.autocomplete').tinyAutocomplete({ onSelect:function(el, val){...} });
```
This is the method that fires when user has selected an option in the autocomplete list, and it's scoped to the field the user is typing in. You get to decide what to do with the information - possibly load data via AJAX or redirect the user to the selected object's page. If user has just pressed enter without selecting an object, or has selected the lastItemTemplate object, the `val` argument will be blank and you should act on $(this).val() instead.


#### minChars:
```javascript
$('.autocomplete').tinyAutocomplete({ minChars:3 });
```
Minimum number of characters user has to type before autocomplete kicks in. Defaults to `2`.


#### keyboardDelay:
```javascript
$('.autocomplete').tinyAutocomplete({ keyboardDelay:400 });
```
The delay between user releasing the key and search being performed. Set this to avoid firing lots of requests while the user is typing. Defaults to `200`


#### timeLimit:
```javascript
$('.autocomplete').tinyAutocomplete({ timeLimit:1000 });
```
Maximum amount of searches allowed in a given time frame. If a search fires too soon, it will be queued up and fire again when it's allowed to do so.


#### queryProperty:
```javascript
$('.autocomplete').tinyAutocomplete({ queryProperty:'term' });
```
The name of the request property to send in GET or POST request. Defaults to `q`.


#### markAsBold:
```javascript
$('.autocomplete').tinyAutocomplete({ markAsBold:false });
```
Compare the result set with the typed string and wrap any matches in a `<strong />` tag. Processes all the strings in your result set. Defaults to `true`.


#### grouped:
```javascript
$('.autocomplete').tinyAutocomplete({ grouped:true });
```
Whether or not Tiny Autocomplete should render the JSON as a grouped list. If set to false, it will expect a simple array of objects, if set to true it will expect data in this format:
```javascript
[
  {
    "title": "Larks",
    "data": [
      {"title":"Clapper Lark"},
      {"title":"Spike-heeled Lark"}
  }
]
```


#### itemTemplate:
```javascript
$('.autocomplete').tinyAutocomplete({ itemTemplate:'<li class="autocomplete-item">{{id}}: {{title}}</li>' });
```
Template for an item, using a pseudo-mustache engine. Every object will be passed to it and it will perform string interpolation, replacing the {{mustachioed}} values with those from the object. This can be overridden from the server on a per-group basis, like this:
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
Default is `<li class="autocomplete-item">{{title}}</li>`.


#### groupTemplate:
```javascript
$('.autocomplete').tinyAutocomplete({ groupTemplate:'<li class="autocomplete-group"><h2>{{title}}</h2><ul class="autocomplete-items" /></li>' });
```
Change template for an item group, when using grouped view. Default is `<li class="autocomplete-group"><span class="autocomplete-group-header">{{title}}</span><ul class="autocomplete-items" /></li>`. Make sure your `groupContentName` matches the ul class!


#### groupContentName:
```javascript
$('.autocomplete').tinyAutocomplete({ groupContentName: '.my-items'});
```
If you have changed the groupTemplate, you might have to tell Tiny Autocomplete where to put the group's items. Supply it with a class name and it will append the `itemTemplates` there.


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

## License
[MIT]

  [Grouped search]: http://tiny-autocomplete.hal.se/grouped.html
  [Flat search]: http://tiny-autocomplete.hal.se/flat.html
  [MIT]: http://johanhalse.mit-license.org

    