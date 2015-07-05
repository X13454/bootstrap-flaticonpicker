# bootstrap-flaticonpicker



## Presentation

Transforms a &lt;select&gt; containing a list of icons - in one or more &lt;optgroup&gt; -  into a flat icon picker

Works with both Bootstrap and Font-Awesome icons.

This:

![image1](http://img11.hostingpics.net/pics/851246bootstrapflaticonpickerimage2.png)

Becomes this:

![image2](http://img11.hostingpics.net/pics/585116bootstrapflaticonpickerimage1.png)

## Demo

See the [online demo](https://jsfiddle.net/373169Lg/1/) with Bootstrap icons.

See the [online demo](https://jsfiddle.net/373169Lg/2/) with Font-Awesome icons.

## How to use

Use a &lt;select&gt; containing a list of icons (e.g.: &lt;option&gt;glyphicon-refresh&lt;/option&gt;) in one or more &lt;optgroup&gt;:

NB: there are several options that can be passed through a javascript object when the plugin is called.
- maxIconsPerPage - default is (int) 35, any integer greather than 0 is accepted
- allCategoriesText -  default is (string) 'All categories', any string is accepted
- iconSet - default is 'glyphicon', the only alternative is 'fa', which stands for Font-Awesome

```HTML
<select data-flaticonpicker-selector>
    <optgroup label="Category 1">
        <option value="whateveruniquevalue">glyphicon-asterisk</option>
        <option value="2">glyphicon-plus</option>
        <option value="3">glyphicon-eur</option>
        <option value="4">glyphicon-minus</option>
        <option value="5">glyphicon-cloud</option>
        <option value="6">glyphicon-envelope</option>
        <option value="7">glyphicon-pencil</option>
        <option value="8">glyphicon-glass</option>
        <option value="9">glyphicon-music</option>
        <option value="10">glyphicon-search</option>
        <option value="11">glyphicon-heart</option>
    </optgroup>
    <optgroup label="Category 2">
        <option value="12">glyphicon-star</option>
        <option value="13">glyphicon-user</option>
        <option value="14">glyphicon-film</option>     
        <option value="15">glyphicon-th-large</option> 
        <option value="16">glyphicon-th-list</option> 
        <option value="17">glyphicon-th</option>
        <option value="18">glyphicon-remove</option> 
        <option value="19">glyphicon-signal</option> 
        <option value="20">glyphicon-cog</option> 
        <option value="21">glyphicon-trash</option> 
        <option value="22">glyphicon-home</option> 
    </optgroup>
    <optgroup label="Category 3">
        <option value="23">glyphicon-road</option>
        <option value="24">glyphicon-download</option>
        <option value="25">glyphicon-upload</option>
        <option value="26">glyphicon-inbox</option>
        <option value="27">glyphicon-play-circle</option>
        <option value="28">glyphicon-repeat</option>
        <option value="29">glyphicon-refresh</option>
    </optgroup>
</select>
```

Add the dependency files (jQuery and Bootstrap 3 CSS and optionally Font-Awesome CSS):

```HTML
<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css">
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>

<!-- Font-Awesome is optional, add this line only if you want to use Font-Awesome icons -->
<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">

<script src="bootstrap-flaticonpicker.js"></script>
```

Call the plugin with default options:
```JavaScript
$('select[data-selectsplitter-selector]').flaticonpicker();
```

Or call the plugin with custom options:
```JavaScript
$('select[data-selectsplitter-selector]').flaticonpicker({maxIconsPerPage: 10; iconSet: 'fa'});
```

## Bower
bower install bootstrap-flaticonpicker

##CDN

```HTML
<script src="//cdn.jsdelivr.net/bootstrap.flaticonpicker/0.1.0/bootstrap-flaticonpicker.min.js"></script>
```

##Changes


0.1.0 : Initial release


## Copyright and license

Copyright (C) 2015 Xavier Faucon

Licensed under the MIT license. 



