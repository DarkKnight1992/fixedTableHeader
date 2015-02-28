# fixedTableHeader
Fixed Table Header with vanilla javascript.

You will see fixed header for each table when you scroll down the page.

## How to use

All your tables must be within a single block with an id. 
Structure of your code must be as follow :
```html
<div id="content">
(code here if you want)
<table>
        <thead>
            <tr>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td></td>
            </tr>
        </tbody>
</table>
(code here if you want)
</div>
```
Initialize variables for script to work :
```javascript
<script type="text/javascript">
//<!--
var idContainer = 'content'; //mandatory
var marge = 70; //optional
var widthOrMinWidth = 'width'; // optional. Value can be 'width' or 'min-width'
//-->
</script>
```
Then put a link at the bottom of your project, before `</body>` tag :
```html
<script type="text/javascript" src="http://your-domain-name/path-to-js/fixedTableHeader.js"></script>
```

Et c'est tout, bigre bougre !!!
