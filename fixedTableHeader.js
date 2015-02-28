/*
# ------------------ BEGIN LICENSE BLOCK ------------------
#
# This file is part of SIGesTH
#
# Copyright (c) 2009 - 2015 Cyril MAGUIRE, <contact@ecyseo.net>
# Licensed under the CeCILL v2.1 license.
# See http://www.cecill.info/licences.fr.html
#
# ------------------- END LICENSE BLOCK -------------------
*/

// marge est la distance entre le haut de la fenêtre et le haut du tableau 
// à partir de laquelle l'entête du tableau est en position fixe
// Utile s'il y a un bloc fixe en haut de page, afin d'éviter que l'entête du tableau ne s'affiche en dessous
if (marge == undefined || marge == null || isNaN(marge) == true) var marge = 100;
if (widthOrMinWidth == undefined || widthOrMinWidth == null) var widthOrMinWidth = 'min-width';
if (idContainer == undefined || idContainer == null) {  
    var idContainer;
    alert('Message de fixedTableHeader.js : Vous devez définir un container !');
}
if (document.getElementById(idContainer) == undefined) {  
    alert('Message de fixedTableHeader.js : Le container '+idContainer+' n\'existe pas !');
}
;(function(idContainer,marge,widthOrMinWidth,window,undefined){
        'use_strict';
        
        if (idContainer == undefined || idContainer == null) return;

        if (widthOrMinWidth != 'min-width') {
            if (widthOrMinWidth != 'width') {
                widthOrMinWidth = 'min-width';
            }
        }

        // On convertit en integer en utilisant |0 à la place de parseInt moins fiable
        // voir http://www.js-attitude.fr/2012/12/26/convertir-un-nombre-en-texte-en-javascript/
        marge = (marge|0);

        var isIE = isBrowserIE();
        function isBrowserIE() {
            //var isMSIE = /*@cc_on!@*/0;  
            var nav = navigator.userAgent.toLowerCase();
            return (nav.indexOf('msie') != -1) ? (nav.split('msie')[1]|0) : false;
        }

        function Remove(idOfParent,idToRemove) {
            if (isIE) {
                document.getElementById(idToRemove).removeNode(true);
            } else {
                var Node1 = document.getElementById(idOfParent); 
                var len = Node1.childNodes.length;

                for(var i = 0; i < len; i++){           
                    if (Node1.childNodes[i] != undefined && Node1.childNodes[i].id != undefined && Node1.childNodes[i].id == idToRemove){
                        Node1.removeChild(Node1.childNodes[i]);
                    }
                }
            }   
        }

        function addElement(DomParent,elemToAdd,htmlToInsert,id) {

            var newElement = document.createElement('div');
            document.body.appendChild(newElement);
            newElement.innerHTML = htmlToInsert;
            if (id != '') {
                newElement.setAttribute('id',id+'_wrapper');
            }
        }

        function getScrollPosition() {
            return Array(
                (document.documentElement && document.documentElement.scrollLeft) || window.pageXOffset || self.pageXOffset || document.body.scrollLeft,
                (document.documentElement && document.documentElement.scrollTop) || window.pageYOffset || self.pageYOffset || document.body.scrollTop
                );
        }

        function arrayCompare(a1, a2) {
            if (a1.length != a2.length) return false;
            var length = a2.length;
            for (var i = 0; i < length; i++) {
                if (a1[i] !== a2[i]) return false;
            }
            return true;
        }
        function inArray(needle, haystack) {
            var length = haystack.length;
            for(var i = 0; i < length; i++) {
                if(typeof haystack[i] == 'object') {
                    if(arrayCompare(haystack[i], needle)) return true;
                } else {
                    if(haystack[i] == needle) return true;
                }
            }
            return false;
        }

        /*
        Récupère la position réelle d'un objet dans la page (en tenant compte de tous ses parents)
        IN  : Obj => Javascript Object ; Prop => Offset voulu (offsetTop,offsetLeft,offsetBottom,offsetRight)
        OUT : Numérique => position réelle d'un objet sur la page.
        */
        function GetDomOffset( Obj, Prop ) {
            var iVal = 0;
            while (Obj && Obj.tagName != 'body') {
                eval('iVal += Obj.' + Prop + ';');
                Obj = Obj.offsetParent;
            }
            return iVal;
        }

        var fixedHeaderTable = {
            tbl:[],
            init: function() {
                this.addEventListener(window,"scroll", this);
            },
            addEventListener: function(el, eventName, handler) {
                if (el.addEventListener) {
                    el.addEventListener(eventName, handler, false);
                } else {
                    el.attachEvent('on' + eventName, fixedHeaderTable.handleEvent);
                }
            },
            handleEvent: function(e) {
                var evt = e ? e:event;
                if (isIE) {
                    var obj = null;
                    obj = fixedHeaderTable;
                } else {
                    var obj = Object.create(null);
                    obj = this;
                }
                var pos = getScrollPosition();
                for (var i = 0,c = obj.tbl.length; i < c; i++) {
                    if (obj.tbl[i] != undefined) {
                        if (obj.tbl[i].posTop > 0 && obj.tbl[i].posBottom > 0) {
                            pos[1] += obj.tbl[i].containerPosTop;
                            if (pos[1] < obj.tbl[i].posTop) {
                                obj.action(i,false);
                            }
                            if (pos[1] > obj.tbl[i].posTop) {
                                obj.action(i,true);
                            }
                            if (pos[1] >= obj.tbl[i].posBottom) {
                                obj.action(i,false);
                            }
                        }
                    }
                };
            },
            action: function(i,display) {
                var clone = document.getElementById('fixedtableheader'+i);
                if (clone) {
                    if (display === true) {
                        clone.style.display = 'block';
                    }
                    if (display === false) {
                        clone.style.display = 'none';
                    }
                }
            },
        };

        var posBottom = 0;
        var posTop = 0;
        var mainDiv = document.getElementById(idContainer);
        var disp = mainDiv.style.display;
        if (disp == '') { disp = 'block'; }
        var containerPosTop = 0;
        // afin de déterminer la position des tableaux, on affiche le bloc qui les contient, s'il est masqué
        if(disp != 'block') {
            mainDiv.style.display = 'block';
            containerPosTop = GetDomOffset( mainDiv, 'offsetTop' );
        }
        var tables = mainDiv.getElementsByTagName('table');
        // widths est l'ensemble des largeurs de colonnes pour chaque tableau
        var widths = [];
        if (tables.length > 0){
            for (var i = 0,c = tables.length; i <= c; i++) {
                var lastcell = tables[i].getElementsByTagName('tr');
                for (var j = 0,clast = lastcell.length; j <= clast; j++) {
                    if(j == 0) { posTop = GetDomOffset(lastcell[0],'offsetTop');}
                    if(j == clast) { posBottom = GetDomOffset(lastcell[j-1],'offsetTop');}
                }
                fixedHeaderTable.tbl[i] = new Object();
                fixedHeaderTable.tbl[i].table = tables[i]; 
                fixedHeaderTable.tbl[i].containerPosTop = containerPosTop;
                fixedHeaderTable.tbl[i].posTop = posTop;
                fixedHeaderTable.tbl[i].posBottom = posBottom;
                fixedHeaderTable.tbl[i].posLeft = GetDomOffset( tables[i], 'offsetLeft' );

                var size = tables[i].getElementsByTagName('thead');
                if (size[0]) {
                    var nbOfRowsInHead = size[0].getElementsByTagName('tr').length;
                }
                // TBODY
                var tBod = tables[i].getElementsByTagName('tbody');
                if (tBod[0]) {
                    var nbOfRows = tBod[0].getElementsByTagName('tr');
                }
                var nbOfCols = 0;
                var cellsOfThisRow = [];
                if (nbOfRows) {
                    for (var thisRow = 0,allRowsOfBody = nbOfRows.length; thisRow < allRowsOfBody; thisRow++) {
                        cellsOfThisRow[thisRow] = nbOfRows[thisRow].getElementsByTagName('td');
                        var nbOfTdInThisRow = cellsOfThisRow[thisRow].length;
                        nbOfCols = (nbOfTdInThisRow >= nbOfCols ? nbOfTdInThisRow : nbOfCols);
                    }
                }

                var colWidth = [];
                var indexOfCol = 0;
                if (allRowsOfBody) {
                    for (var row = 0; row < allRowsOfBody; row++) {                            
                        for (var cel = 0,nbOfCells= cellsOfThisRow[row].length; cel < nbOfCells; cel++) {
                            var widthOfThisCell = cellsOfThisRow[row][cel].offsetWidth;
                            colWidth[indexOfCol] = (widthOfThisCell > colWidth[indexOfCol] ? colWidth[indexOfCol] : widthOfThisCell);
                            indexOfCol++;
                        }
                    }
                }
                    
                // THEAD
                indexOfCol = 0;
                if (size[0]) {
                    // largeurs est l'ensemble des largeurs de colonnes pour un tableau donné
                    var largeurs = [];
                    widths[i] = [];
                    // Pour chaque ligne d'entête
                    for (var k = 0; k < nbOfRowsInHead; k++) {
                        if (size[k] != undefined) {
                            if(disp == 'block') {
                                fixedHeaderTable.tbl[i].posBottom -= ((size[k].offsetHeight/2)+marge);
                            } else {
                                fixedHeaderTable.tbl[i].containerPosTop -= ((size[k].offsetHeight*2)+marge);
                            }
                            var cells = size[k].getElementsByTagName('th');
                            for (var l = 0,ccells = cells.length; l < ccells; l++) {
                                largeurs[indexOfCol] = colWidth[indexOfCol];
                                if (indexOfCol<nbOfCols-1) {
                                   indexOfCol++;
                                } else {
                                   break;
                                }
                            }
                            for (var larg = 0,tot = largeurs.length; larg < tot; larg++) {
                                if (largeurs[larg] != null) {
                                    widths[i].push(largeurs[larg]);
                                }
                            }
                            var clone = size[k].cloneNode(true);
                            var mainTab = document.createElement('div');
                            mainDiv.setAttribute('style', 'position:relative;');
                            mainDiv.appendChild(mainTab);
                            mainTab.innerHTML = '<table id="fixedtableheader'+i+'" class="fixedtableheader"></table>';
                            mainTab.setAttribute('style', 'position:relative;');
                            var tabFake = document.getElementById('fixedtableheader'+i);
                            tabFake.setAttribute('style', 'display:block;position:fixed;top:'+marge+'px;max-width:'+mainTab.offsetWidth+'px;');
                            tabFake.style.display = 'none';
                            tabFake.appendChild(clone);
                            var rowsFake = document.getElementById('fixedtableheader'+i).getElementsByTagName('tr');
                            for (var eachRowOfHead = 0; eachRowOfHead < nbOfRowsInHead; eachRowOfHead++) {
                                var cellsFake = rowsFake[eachRowOfHead].getElementsByTagName('th');
                                for (var m = 0; m < nbOfCols; m++) {
                                    var colsp = cellsFake[m].getAttribute('colspan');
                                    if (colsp != null) {
                                        eachRowOfHead++;
                                        m = nbOfCols;
                                    } else {
                                        if (cellsFake[m].innerHTML == '') {
                                            cellsFake[m].innerHTML = '&nbsp;';
                                        }
                                        cellsFake[m].setAttribute('style',widthOrMinWidth+':'+widths[i][m]+'px;');   
                                    }
                                };
                            };
                            delete clone;
                        }
                    }
                } else {
                    fixedHeaderTable.tbl.splice(i,1);
                }
            };
        fixedHeaderTable.init();
    }

        mainDiv.style.display = disp; 

})(idContainer,marge,widthOrMinWidth,window);