/*jslint browser: true, devel: true, bitwise: true, plusplus: true, regexp: true, unparam: true, sloppy: true, todo: true, vars: true, white: true */
/*also define: $find VerifyRemoteCheckSapInvoice verifyRemoteCheckGL jsExp radopen PageMethods*/

//#region Misc.

//stackoverflow.com/a/12444641/1387518
//var isShiftDown = false;
function KeyPress(ctrl, e) {
    //alert("Key code: " + e.get_domEvent().rawEvent.keyCode);
//    isShiftDown = e.get_isShiftPressed();
//    if (e.get_keyCode() == 9) {
//        alert("Is Shift pressed: " + e.get_isShiftPressed());
//        alert("Is Ctrl pressed: " + e.get_isCtrlPressed());
//        alert("Is Alt pressed: " + e.get_isAltPressed());
//    }
    if (e.get_domEvent().rawEvent.keyCode === 13) {
        e.get_domEvent().preventDefault();
        e.get_domEvent().stopPropagation();
    }
}

function isSafeSql(str, maxLen) {

    var showAlerts, result, resUp, foundXp, foundKeyword;

    showAlerts = false;

    if (maxLen !== null && str.length > maxLen) {
        return 4;
    }

    // Don't forget to escape final '/' for JavaScript! Remove that if using on RegExr.com.
    result = str.match(/^[ _a-zA-Z0-9!@#$%\^&*\(\)-\\|:;'",.?\/]{1,40}$/g);
    if (result === null || result.length < 1) {

        if (showAlerts) {
            alert("Contains characters other than these:\r\n _a-zA-Z0-9`~!@#$%^&*()-{}[]\\|:;<>,.?\/");
        }

        return 1;
    }

    /// Convert result to string:
    //resUp = result + "";
    //resUp = resUp.toUpperCase();
    resUp = result.toString().toUpperCase();

    foundXp = false;
    foundXp |= (resUp.indexOf("--") !== -1);
    foundXp |= (resUp.indexOf("XP_") !== -1);
    if (foundXp) {

        if (showAlerts) {
            alert("Failed XP Test");
        }

        return 2;
    }

    foundKeyword = false;
    foundKeyword |= (resUp.indexOf("DELETE ") !== -1);
    foundKeyword |= (resUp.indexOf("DROP ") !== -1);
    foundKeyword |= (resUp.indexOf("UPDATE ") !== -1);
    foundKeyword |= (resUp.indexOf("ALTER ") !== -1);
    if (foundKeyword) {

        if (showAlerts) {
            alert("Failed Keyword Test");
        }

        return 3;
    }

    if (showAlerts) {
        alert("Success!");
    }

    return -1;
}

function toCurrency(amountInput) {

    var i, minus, halfCent, s;

    // Replace all commas (',') because these cause the comma to be treated as the decimal point.
    // For example: 1,000 would be changed to 1.00.
    amountInput = amountInput.toString().replace(/,/g, "");

    // Convert the parameter to a float value:
    i = parseFloat(amountInput);

    // If it's not a valid number, set it to $0.00:
    if (isNaN(i)) {
        i = 0.00;
    }
    
    // Show or Hide the minus symbol
    minus = '';
    if (i < 0) {
        minus = '-';
    }

    // Get the absolute value of the amount
    i = Math.abs(i);

    // Round it to the nearest hundreths place
    halfCent = Number('0.005');
    i = parseInt((i + halfCent) * 100, 10);
    i = i / 100;

    // Add any necessary decimal places
    s = String(i);
    if (s.indexOf('.') < 0) {
        s += '.00';
    }
    if (s.indexOf('.') === (s.length - 2)) {
        s += '0';
    }

    // Add the minus string (blank if positive, '-' if negative)
    s = minus + s;

    // Return the new value
    return s;
}

function toValidWorkCurrency(amountInput) {

    var maxAmount = 4999999.99, // Company's single check limit
        i, s;

    amountInput = amountInput.toString().replace(/,/g, "");
    i = parseFloat(amountInput);

    if (i < 0.01) {
        i = 0.00;
    }
    else if (i > maxAmount) { 
        i = 0.00;
    }

    s = String(i);

    if (s.indexOf('.') < 0) {
        s += '.00';
    }

    if (s.indexOf('.') === (s.length - 2)) {
        s += '0';
    }

    return s;
}

// Parse string for XML tag
function getTagValue(xmlStr, tag) {

    var locA, locNextClose, locB, tagValue;

    locA = xmlStr.indexOf("<" + tag);
    //alert(locA);

    locNextClose = xmlStr.indexOf(">", locA);

    locB = xmlStr.indexOf("</" + tag + ">");
    //alert(locB);

    tagValue = "";

    if ((locA > -1) && (locB > locA)) {
        tagValue = xmlStr.substring(locNextClose + 1, locB);
        //alert("Tag Value: " + tagValue);
    }

    return tagValue;
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function fireKey(el) {
    //Set key to corresponding code. This one is set to the left arrow key.
    var key = 37;
    if (document.createEventObject) {
        var eventObj = document.createEventObject();
        eventObj.keyCode = key;
        el.fireEvent("onkeydown", eventObj);
        //alert("done");
    } else if (document.createEvent) {
        var eventObj = document.createEvent("Events");
        eventObj.initEvent("keydown", true, true);
        eventObj.which = key;
        el.dispatchEvent(eventObj);
        //alert("done");
    }
}

//function onClientLoad(sender, args) {
//    $telerik.$('.tb').bind('keypress', function (event) {
//        if (event.which === 9) {
//            event.preventDefault();
//            $telerik.$(this).parent().next().children()[0].focus();
//        }
//    });
//}

function rcbDetailAmountUpdate(obj) {

    var debugMsg = false;

    // Old value (ex. 4.00):
    document.getElementById('ucPaymentRCBatch_hiddenSplitAmount').value = amtSplitOld.toString().replace(/,/g, "");

    // New value (ex. 4.50):
    obj.value = obj.value.toString().replace(/,/g, "");

    // Now update the old value:
    document.getElementById('ucPaymentRCBatch_hiddenSplitAmount').value = amtSplitNew;

    // Diff (ex. 0.50):
    var diff = toCurrency(parseFloat(amtSplitNew) - parseFloat(amtSplitOld));

    // Old Total (ex. 10.00):
    var amtSplitTotal = document.getElementById('ucPaymentRCBatch_hiddenSplitAmountTotal').value;
    amtSplitTotal = amtSplitTotal.toString().replace(/,/g, "");

    // New Total (ex. 10.00 + 0.50 = 10.50):
    var amtSplitTotalNew = toCurrency(parseFloat(amtSplitTotal) + parseFloat(diff));

    // Update the total:
    var markupOld = obj.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByTagName("tfoot")[0].innerHTML;
    var hTotalOld = "Total Amount: $</td><td>" + amtSplitTotal;
    var hTotalNew = "Total Amount: $</td><td>" + amtSplitTotalNew;
    var markupNew = markupOld.replace(hTotalOld, hTotalNew);
    if (debugMsg) alert("markupNew = " + markupNew);

    // Old Remaining (ex. 0.00)
    var amtSplitRemaining = document.getElementById('ucPaymentRCBatch_hiddenSplitAmountRemaining').value;
    amtSplitRemaining = amtSplitRemaining.toString().replace(/,/g, "");
    //alert(amtSplitRemaining);

    // New Remaining (ex. 0.50):
    var amtSplitTotalNew = toCurrency(parseFloat(amtSplitRemaining) - parseFloat(diff));
    //alert(amtSplitTotalNew);

    var hRemainingOld = "Remaining: $</td><td>" + amtSplitRemaining;
    //alert(hRemainingOld);
    
    var hRemainingNew = "Remaining: $</td><td>" + amtSplitTotalNew;
    //alert(hRemainingNew);

    var markupFinal = markupNew.replace(hRemainingOld, hRemainingNew);
    //alert(markupFinal);

    obj.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByTagName("tfoot")[0].innerHTML = markupFinal;
    if (debugMsg) alert("markupNew = " + markupFinal);

    /*
    //var index = obj.parentNode.parentNode.rowIndex - 1;
    //alert("[rcbDetailAmountUpdate] index: " + index);

    // 0 (so we didn't get anything):
    //alert(document.getElementsByTagName("lblDtlTransAmount").length);
    //alert(document.getElementsByTagName("rgDetailItems").length);


    //var grid = $find("ucPaymentRCBatch_rgCheckBatch_ctl00_ctl05_rgDetailItems");
    //alert(grid.getElementsByTagName("lblDtlTransAmount").length);

    var grid = $find("ucPaymentRCBatch_rgCheckBatch_ctl00_ctl05_rgDetailItems");
    if (grid === null) {
    alert("Null :(");
    }
    else {
    //alert("Got it!");
    var MasterTable = grid.get_masterTableView();

    //var footerLabelID = '< %= ((GridFooterItem)ucPaymentRCBatch_rgCheckBatch_ctl00_ctl05_rgDetailItems.MasterTableView.GetItems(GridItemType.Footer)[0]).FindControl("lblTotalWeight").ClientID %>';

    //var items = MasterTable.GetItems(Footer);
    //if (items === null) {
    //    alert("items is null :(");
    //}
    //else {
    //    alert("Got items!");
    //}

    //var footerTable = grid.get_masterTableViewFooter();
    //if (footerTable === null) {
    //    alert("footerTable is null :(");
    //}
    //else {
    //    alert("Got footerTable!");
    //}

    // 0:
    var index = obj.parentNode.parentNode.rowIndex - 1;
    //alert(index);

    alert(document.getElementById("lblDtlTransAmount"));

        

    // ?:
    var row = MasterTable.get_dataItems()[index];
    alert(row);

    //ucPaymentRCBatch_rgCheckBatch_ctl00_ctl05_rgDetailItems_ctl00_ctl04_ctl00

    // empty:
    var detailViews = row.get_nestedViews();
    alert(detailViews);

    // undefined:
    var firstDetail = detailViews[0];
    alert(firstDetail);

    //for (var i = 0; i < detailView1.get_dataItems().length; i++) {
    //    alert(detailView1.get_dataItems()[i]);
    //}
    }

    //alert("[rcbDetailAmountUpdate] Start.");

    //var masterTable = $find("< %= RadGrid1.ClientID%>").get_masterTableView();

    //var footerTable = grid.get_masterTableViewFooter().get_element();
    //var footer = masterTable.get_element().getElementsByTagName("TFOOT")[0];

    //alert(obj.parentNode.parentNode.rowIndex - 1);
    //alert(obj.name); // ucPaymentRCBatch$rgCheckBatch$ctl00$ctl05$rgDetailItems$ctl00$ctl05$ctl01

    */
}

function rcbOnBlurAmount(e, index, gridName, columnName) {

    /// New Amount:
    var grid = $find(gridName);
    if (grid === null) {
        return;
    }
    var MasterTable = grid.get_masterTableView();
    if (MasterTable === null) {
        return;
    }
    Rows = MasterTable.get_dataItems();
    var amountEdit = Rows[index].get_cell("TransAmount").getElementsByTagName("input")[0].value;
    amountEdit = toCurrency(amountEdit);

    /// Old Amount:
    var aInner = MasterTable.getCellByColumnUniqueName(Rows[index], "TransAmount").innerHTML;
    var amountOld = aInner.substring(aInner.indexOf("value=\"") + 7);
    amountOld = amountOld.substring(0, amountOld.indexOf("\""));
    amountOld = toCurrency(amountOld);

    if (amountEdit != amountOld) {
        var taEdit = toCurrency(Rows[index].get_cell("TransAmount").getElementsByTagName("input")[0].value);
        if (taEdit !== toValidCurrency(taEdit)) {
            alert(taEdit + " is an invalid amount.");
            return;
        }

        Rows[index].get_cell("TransAmount").getElementsByTagName("input")[0].value = taEdit;
    }
    else {
        //alert("amount is the same.");
        return;
    }

    var amountAllocated = calculateRcbAmount(false, true);

    var txtCA = document.forms[0]['ucPaymentRCBatch_txtTotalSaleAmount'];
    if (txtCA === null) {
        return;
    }
    var controlAmount = toCurrency(txtCA.value);

    updateTotals("ucPaymentRCBatch", amountAllocated, controlAmount);
}

function rcbOnBlurRowEnd(e, index, gridName, columnName) {
    // If the user is leaving the textbox because they pressed Tab and the current textbox
    // is at the end of the row, and the row is the final row, don't continue.
    // However, if the row is expanded, continue into the row's detail textboxes.
    if ((e.which || e.keyCode) === 9) {
        var grid = $find(gridName);
        if (!grid) {
            return;
        }
        if (grid.get_editItems().length === (parseInt(index) + 1)) {
            var MasterTable = grid.get_masterTableView();
            var editItems = grid.get_editItems();
            var editRow = editItems[parseInt(index)];
            if (!editRow.get_expanded()) {
                var Cell = editRow.get_cell(columnName);
                Cell.focus();
            }
        }
    }
}

function rcbOnBlurBackwardTab(e, index) {
    var dir = 0;
    //alert("[rcbOnBlurBackwardTab] Start");
    //alert("[rcbOnBlurBackwardTab] Key code: " + e.get_domEvent().rawEvent.keyCode);
    if ((e.which || e.keyCode) === 9) {
        //alert(isShiftDown);
        dir = (isShiftDown) ? -1 : 1;
    }

    if (dir != 0) {
        //alert(dir);
    }

    return;

}

function rcbOnBlurForwardTab(e, index) {
    if ((e.which || e.keyCode) === 9) {
        var grid = $find("ucPaymentRCBatch_rgCheckBatch");
        if (grid.get_editItems().length === (parseInt(index) + 1)) {
            //alert("Too far!");
            return;
        }

        var MasterTable = grid.get_masterTableView();
        var editItems = grid.get_editItems()[(parseInt(index) + 1)];

        var cellCN = MasterTable.getCellByColumnUniqueName(editItems, "CheckNum");
        //alert(cellCN); // HTMLTableDataCellElement
        cellCN.focus();

        // Gets the correct value! BUT... it still has the text highlighted (meaning it clears, sets the value back, then highlights it).
        //var Cell = editItems.get_cell("CheckNum");
        //var cell_input = Cell.childNodes[0].value;
        //Cell.childNodes[0].value = "";
        //alert(Cell.childNodes[0].value);
        //Cell.childNodes[0].value = cell_input;
        //alert(Cell.childNodes[0].value);

        // Focus doesn't work (focuses on one item down and one item over):
        //alert(Cell.childNodes[0]); // HTMLInputElement
        //Cell.childNodes[0].focus();

        // Focus works:
        //alert(Cell); // HTMLTableDataCellElement
        //Cell.focus();

//        grid.set_activeRow(grid.get_masterTableView().get_dataItems()[0].get_element());
//        grid.get_masterTableView().get_dataItems()[0].get_element().cells[0].focus(); 

        //MasterTable.deselectItem(MasterTable.get_dataItems()[(parseInt(index) + 1)].get_element());

        //fireKey(Cell);

        //var innerCN = cellCN.innerHTML;        
        //alert(innerCN);
        //alert(cellCN.valueOf);

        //var row = masterTable.get_dataItems()[(parseInt(index) + 1)];
        //var value = row.getDataKeyValue("CheckNum");


//        var locId = innerCN.indexOf("name=");
//        var locIdEnd = innerCN.indexOf("\" ", locId);
//        var idVal = innerCN.substr(locId + 6, locIdEnd - locId - 6); // ucPaymentRCBatch$rgCheckBatch$ctl00$ctl04$ctl02
//        idVal = idVal.replace(/[\$]+/g, '_');
//        alert(idVal);
//        var next = document.getElementsByName(idVal)[0];
//        if (next) {
//            alert("Found it!!!");
//            next.focus();
//        }
//        else {
//            alert("next (" + idVal + ") is null!");
//        }
        
        //var mtv = grid.get_masterTableView();
//        var editItem = mtv.get_editItems()[4];
//        alert(cellValue);
//        var cellValue = editItem.getDataKeyValue("CheckNum");
//        //alert("CheckNum value = " + cellValue.value);
//        alert(cellValue);
    }
    else {
        //alert("No TAB key pressed.");
    }
}

function leaveStartOnDate(sender, args) {
    var dp, showDate, sd, ds, ea;

    showDate = false;

    dp = $find("ucPaymentCC_txtStartOnDate");
    if (!dp) {
        return;
    }

    dp.hidePopup();

    ea = document.getElementById("ucPaymentCC_txtEndAfter");
    if (ea) {
        ea.focus();
    }

    if (showDate) {

        sd = dp.get_selectedDate();
        if (!sd) {
            return;
        }

        ds = sd.format("MM/d/yyyy");
        if (!ds) {
            return;
        }
    }
}

//#endregion Misc.

//#region Popup and Focus functions

function showPopUp(content) {
    var con = document.getElementById("txtPopUpContent"),
        pop = $find("popupwindow"),
        conOK = document.getElementById("OkButton");

    if (content === "SUCCESS") {
        return;
    }

    if (con === null) {
        return;
    }

    if (pop === null) {
        return;
    }

    if ((conOK === null) || (conOK === "")) {
        return;
    }

    con.innerHTML = content;

    pop.show();

    /// Focus on the OK button in the popup:
    conOK.focus();
}

function showPopUpThenFocus(content, control) {

    showPopUp(content);

    document.getElementById('hiddenFocus').value = control;
}

/// Called via code registered server-side.
function showOkCancelPopUp(source, content) {

    /// If we don't have a source then return. We need it!
    if (source === null || source === "") {
        return;
    }

    /// Replace all '$' with '_' for accessing user controls:
    source = source.replace(/[\$]+/g, '_');

    /// Set the current source value:
    document.getElementById('hiddenOkCancelSource').value = source;

    /// Set the message to display to the user in the popup:
    document.getElementById("txtOkCancelPopUpContent").innerHTML = content;

    /// Show the popup:
    var pop = $find("popupOkCancelWindow");
    pop.show();

    /// Focus on the Cancel button
    var conCancel = document.getElementById("btnCancel");
    if (conCancel !== "" && conCancel !== null) {
        conCancel.focus();
    }
}

/// Called by the OK/Cancel Popup buttons.
function UserOkCancel(choice) {

    /// Get the source of the confirmation.  This is going to be a button
    /// that the user clicked, e.g. the Reports left nav button.
    var source = document.getElementById('hiddenOkCancelSource').value;

    /// The user made a choice so hide the OK/Cancel Popup.
    var pop = $find("popupOkCancelWindow");
    pop.hide();

    /// If the user clicked Cancel, just return now that we've hidden the window.
    /// Otherwise, the user clicked "OK" so continue.
    if (!choice) {
        return;
    }

    /// Figure out the page the user was on when they fired the initial confirmation.
    /// This is the page that the source is on, e.g. if the source is 
    /// ucUniversalLeftPayment_btnLeftReports then the page is ucUniversalLeftPayment.
    var thePage = source.substr(0, source.indexOf('_'));

    /// Find the choice holder element on the source page, and if it's not null, then
    /// set the choice the user made to the hidden value.
    var choiceHolder = document.getElementById(thePage + '_' + 'hiddenOkCancelChoice');
    if (choiceHolder) {
        choiceHolder.value = choice;
    }

    /// Get the element to click and if it's not null then click it!
    var toClick = document.getElementById(source);
    if (toClick) {
        toClick.click();
    }
}

function Focus() {

    var debugFocus = false;

    try {

        /*
        var grid = $find("ucPaymentRCBatch_rgCheckBatch");
        if (grid) {

        var EditItems = grid.get_editItems();
        alert(EditItems.length);

        for (var i = 0; i < EditItems.length; i++) {

        var gdi = EditItems[0];
        alert(gdi);

        var masterTable = grid.get_masterTableView();
                            
        var cellCN = masterTable.getCellByColumnUniqueName(gdi, "CheckNum");
        alert(cellCN);

        var innerCN = cellCN.innerHTML;
        alert(cellCN);

        var locId = innerCN.indexOf("id=");
        var locIdEnd = innerCN.indexOf("\" ", locId);
        var idVal = innerCN.substr(locId + 4, locIdEnd - locId - 4);
        alert(idVal);
        var txtCN = document.getElementById(idVal);
        if (txtCN) {
        txtCN.focus();
        }
        else {
        alert("txtCN is null");
        }

        //var cbx1 = $(gdi.get_editFormItem()).find("input[id*='CB']").get(0);

        }
        }

        return;
        */

        /// Get the control that holds the ID to focus on
        var hid = document.getElementById('hiddenFocus');
        //if (debugFocus) {
        //    alert("[Focus] hid: " + hid);
        //}

        /// If there is an ID to focus on:
        if (hid.value !== "") {

            /// Get the control to focus on
            //var toFocus = document.getElementById('hiddenFocus').value;
            var toFocus = hid.value;
            if (debugFocus) {
                alert("[Focus] toFocus: " + toFocus);
            }

            /// Reset the control value
            document.getElementById('hiddenFocus').value = "";

            /// Get the control object
            var con = document.getElementById(toFocus);

            /// Focus on the control object
            if (con === null) {
                if (debugFocus) {
                    alert("[Focus] con is null");
                }
                return;
            }

            if (con === "") {
                if (debugFocus) {
                    alert("[Focus] con is empty");
                }
                return;
            }

            con.focus();
        }
        else {
            if (debugFocus) {
                alert("[Focus] hid has no value");
            }
        }
    }
    catch (ignore) {
        //if (debugFocus) {
        //    alert("[Focus] Major error: " + exFocus.Message);
        //}
    }
}

function OnSelectedIndexChangedHandler(sender, eventArgs) {

    if (sender !== null) {

        var rcbPayType = $find("ucPaymentCC_rcbPaymentType");

        if (rcbPayType !== null) {

            var payType = rcbPayType.get_selectedItem().get_value();

            if (payType !== null) {

                if (payType === "Check21With" || payType === "Check21No") {

                    var glVal = sender.get_value();

                    if (glVal !== "") {

                        verifyRemoteCheckGL(glVal, sender.get_id()); // registered in code-behind
                    }
                }
            }
        }
    }
}

function OnTextChangeHandler(sender, eventArgs) {

    if (sender !== null) {

        var rcbPayType = $find("ucPaymentCC_rcbPaymentType");

        if (rcbPayType !== null) {

            var payType = rcbPayType.get_selectedItem().get_value();

            if (payType !== null) {

                if (payType === "Check21With" || payType === "Check21No") {

                    var glText = sender.get_text();

                    if (glText !== "") {

                        verifyRemoteCheckGL(glText, sender.get_id()); // registered in code-behind
                    }
                }
            }
        }
    }
}

function amountChangedCredit(source) {
    var val, a0, c0, tb;
    val = document.forms[0][source];
    if (val !== null) {
        a0 = val.value;
        if (a0 !== "") {
            c0 = toCurrency(a0);
            c0 = toValidCurrency(c0);
            tb = document.getElementById(source);
            tb.value = c0;
        }
    }
}

// Given the current sum, update the "Total Allocated" and "Remaining..." labels with their new calculated values.
function updateTotals(source, sum, saleTotal) {
    var total, lblTotalAmountAllocated, totalSaleAmount, leftToAllocate, lblAmountLeft;

    /// Convert the Total Sum to currency:
    total = toCurrency(sum);

    /// Set the label for Total Amount Allocated:
    lblTotalAmountAllocated = document.getElementById(source + '_lblTotalAmountAllocated');
    if (lblTotalAmountAllocated !== null) {

        // Reset the label's text (Payment page actually puts the words in there, RCB just puts the amount):
        if (lblTotalAmountAllocated.innerHTML.indexOf("Allocate") > -1) {
            lblTotalAmountAllocated.innerHTML = "Total Allocated: $" + total;
        }
        else {
            lblTotalAmountAllocated.innerHTML = "$ " + total;
        }

        var rcbHAA = document.getElementById("ucPaymentRCBatch_hiddenAmountAllocated");
        if (rcbHAA != null) {
            rcbHAA.value = "$ " + total;
        }
    }

    /// Get the value for the Total Sale Amount:
    totalSaleAmount = toCurrency(saleTotal);

    /// Calculate Total Sale Amount - Total Amount Allocated:
    leftToAllocate = parseFloat(totalSaleAmount) - parseFloat(total);
    leftToAllocate = toCurrency(leftToAllocate);

    /// Set the label for Remaining Amount to Allocate:
    lblAmountLeft = document.getElementById(source + '_lblAmountLeft');
    if (lblAmountLeft !== null) {
    
        // Reset the label's text (Payment page actually puts the words in there, RCB just puts the amount):
        if (lblAmountLeft.innerHTML.indexOf("Allocate") > -1) {
            lblAmountLeft.innerHTML = "Remaining Amount to Allocate: $" + leftToAllocate;
        }
        else {
            lblAmountLeft.innerHTML = "$ " + leftToAllocate;
        }

        var rcbHAL = document.getElementById("ucPaymentRCBatch_hiddenAmountLeft");
        if (rcbHAL !== null) {
            rcbHAL.value = "$ " + leftToAllocate;
        }
    }
}

function calculateRcbAmount(gloDebug, isEditMode) {
    var debugMsg = false, amountAllocated = 0.00, grid, MasterTable, Rows, i, row, cellID, innerVal, alCurrency;

    if (gloDebug === true) {
        debugMsg = true;
    }
    
    try {
        grid = $find("ucPaymentRCBatch_rgCheckBatch");
        if (grid === null) {
            if (debugMsg) {
                alert("[calculateRcbAmount] Grid is null.");
            }
        }

        MasterTable = grid.get_masterTableView();
        if (MasterTable === null) {
            if (debugMsg) {
                alert("[calculateRcbAmount] MasterTable is null.");
            }
        }

        Rows = MasterTable.get_dataItems();

        if (Rows === null) {
            if (debugMsg) {
                alert("[calculateRcbAmount] Rows is null.");
            }
        }
        else {
            if (debugMsg) {
                alert("[calculateRcbAmount] Rows.length: " + Rows.length);
            }
        }

        for (i = 0; i < Rows.length; i++) {

            if (isEditMode) {
                var cell = Rows[i].get_cell("TransAmount");
                innerVal = cell.getElementsByTagName("input")[0].value;
            }
            else {
                innerVal = MasterTable.getCellByColumnUniqueName(Rows[i], "TransAmount").innerHTML;
            }

            innerVal = innerVal.toString().replace(/,/g, "");
            if (debugMsg) {
                alert("[calculateRcbAmount] (" + i + ") innerVal: " + innerVal);
            }

            amountAllocated = amountAllocated.toString().replace(/,/g, "");
            if (debugMsg) {
                alert("[calculateRcbAmount] (" + i + ") amountAllocated before: " + amountAllocated);
            }

            amountAllocated = parseFloat(amountAllocated) + parseFloat(innerVal);
            if (debugMsg) {
                alert("[calculateRcbAmount] (" + i + ") amountAllocated after: " + amountAllocated);
            }
        }
    }
    catch (ex) {
        if (debugMsg) {
            alert("[calculateRcbAmount] Major error: " + ex.message);
        }
    }

    alCurrency = toCurrency(amountAllocated);
    if (debugMsg) {
        alert("[calculateRcbAmount] alCurrency: " + alCurrency);
    }

    return alCurrency;
}

function amountChangedRCB(source) {

    // Control Amount
    var amountControl = 0.00;
    var txt = document.forms[0][source + '_txtTotalSaleAmount'];
    if (txt !== null) {
        var a0 = txt.value;
        if (a0 !== "") {
            var c0 = toCurrency(a0);
            txt.value = c0;
            amountControl = parseFloat(c0);
        }
    }

    // Amount Allocated (RadGrid Sums)
    var amountAllocated = calculateRcbAmount();
    //amountAllocated = toCurrency(amountAllocated);
    var lblTotalAmountAllocated = document.getElementById(source + '_lblTotalAmountAllocated');
    if (lblTotalAmountAllocated !== null) {
        lblTotalAmountAllocated.innerHTML = "$ " + amountAllocated;
    }
    else {
        //alert("Label for Total is null");
    }

    // Remaining Amount to Allocate 
    var amountRemaining = parseFloat(amountControl) - parseFloat(amountAllocated);
    amountRemaining = toCurrency(amountRemaining);
    var lblAmountLeft = document.getElementById(source + '_lblAmountLeft');
    if (lblAmountLeft !== null) {
        lblAmountLeft.innerHTML = "$ " + amountRemaining;
    }
    else {
        //alert("Label for Remaining is null");
    }
}

/// Called by Payment & RecurringPayment screens, not by Main.
function amountChanged(source) {

    var saleTotal, val, a0, c0, TextBox, sum, boxes, i, amountConv;

    saleTotal = 0.00;

    val = document.forms[0][source + '_txtTotalSaleAmount'];
    if (val !== null) {
        a0 = val.value;
        if (a0 !== "") {
            c0 = toCurrency(a0);
            c0 = toValidCurrency(c0);
            TextBox = document.getElementById(source + '_txtTotalSaleAmount');
            TextBox.value = c0;
            saleTotal = parseFloat(c0);
        }
    }

    sum = 0.00;

    boxes = [
        document.getElementById(source + '_txtbAmount1'),
        document.getElementById(source + '_txtbAmount2'),
        document.getElementById(source + '_txtbAmount3'),
        document.getElementById(source + '_txtbAmount4'),
        document.getElementById(source + '_txtbAmount5'),
        document.getElementById(source + '_txtbAmount6'),
        document.getElementById(source + '_txtbAmount7'),
        document.getElementById(source + '_txtbAmount8')
    ];

    for (i = 0; i < boxes.length; i++) {
        if (boxes[i] !== null) {
            if (boxes[i].value !== "") {

                amountConv = toCurrency(boxes[i].value);
                amountConv = toValidCurrency(amountConv);

                if (amountConv === "0.00") {
                    boxes[i].style.color = 'red';
                }
                else {
                    boxes[i].style.color = 'black';
                }

                boxes[i].value = amountConv;

                sum += parseFloat(amountConv);
            }
        }
    }

    updateTotals(source, sum, saleTotal);
}

//#endregion Popup and Focus functions
