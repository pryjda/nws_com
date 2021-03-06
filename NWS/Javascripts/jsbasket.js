// JavaScript Document
// revised for c8.5
;
(function($) {

    $.jsbasket = function(el, options) {

        var $this = $(el),
                vars = $.extend({}, $.jsbasket.defaults, options),
                methods = {};

        methods = {
            init: function() {

                this.createInputObj();

                methods.addIndexOf();

                $this.addBtn = $this.parentsUntil('body').find('.' + vars['add_btn_class']);

                $this.vid = $('#js-vid').val();

                $this.currencySign = null;

                var currencySelect = $('select[name=c]');

                $this.currencyId = 221;


                if (parseInt(vars['currencyId']) > 0) {
                    $this.currencyId = parseInt(vars['currencyId']);
                }

                if (currencySelect.length > 0) {
                    $this.currencyId = currencySelect.val();
                }

                var currency = new Commerce.Domain.Currency($this.vid, $this.currencyId);

                $this.currencySign = currency['domain']['sign'];


                if (vars['type'] == 'textarea') {
                    $this.main_error_obj = $this.textarea;
                } else {
                    $this.main_error_obj = $this.product_fields_table;
                }


                $this.codeRegExp = /^[a-zA-Z0-9-\._]+$/i;

                $this.clearBtn = $this.find('.' + vars['clear_btn_class']);

                //$this.inputSwitch = $('<a>', { href: 'javascript:void(0)', style: 'margin-left: 10px;' });
                $this.POTransferBtn = $this.parentsUntil('body').find('.' + vars['po_transfer_btn']);

                /*
                 if(vars['type'] == 'textarea'){
                 $this.inputSwitch.text(vars['fields_switch_label']);
                 }else{
                 $this.inputSwitch.text(vars['textarea_switch_label']);
                 }
                 
                 $this.inputSwitch.bind('click', this.changeInputType);
                 
                 $this.POTransferBtn.bind('click', function () {
                 if(vars['type'] != 'textarea')methods.changeInputType();
                 });*/

                //$this.clearBtn.after($this.inputSwitch);

                $this.products = {};

                $this.itemsData = {};

                $this.shippingGroups = [];
                $this.addBtn.on('click', $this, this.addProducts);
                $this.clearBtn.bind('click', $this, this.clearProducts);

                if ($this.addLineBtn)
                    $this.addLineBtn.bind('click', $this, this.addLine);

                this.loadBasket();

            },
            /*
             changeInputType: function() {
             
             if(vars['type'] == 'textarea'){
             $this.inputSwitch.add('<p> test<p>');
             $this.inputSwitch.text(vars['textarea_switch_label']);
             vars['type'] = 'fields';
             $this.product_fields.removeClass('hide');
             $this.textarea.parent().addClass('hide');
             }else{
             $this.inputSwitch.text(vars['fields_switch_label']);
             vars['type'] = 'textarea';
             $this.textarea.parent().removeClass('hide');
             $this.product_fields.addClass('hide');
             }
             
             },
             */

            createInputObj: function() {

                var inputObj = $this.find('.' + vars['input_obj_class']);

                if (inputObj.length == 0) {

                    inputObj = $('<div>');
                    inputObj.addClass(vars['input_obj_class']);

                    $this.prepend(inputObj);

                }

                //if(vars['type'] == 'textarea'){

                $this.textarea = $this.parentsUntil('body').find('.' + vars['textarea_class']);
                /*$this.textarea = $('<textarea>');
                 
                 $this.textarea.addClass(vars['textarea_class']);
                 
                 inputObj.append($this.textarea);*/


                // Jp second attempt
                // 		$this.textarea_link = $('<a href="#"');
                // 		$this.textarea_link.html({ value: 'Additional info', type: 'button', class: 'btn' });


                //  Jp. first attempt
                //	    $this.textAreaBtn = $('<a href="#"', { value: 'Additional info', type: 'button', class: 'btn' });
                //		$this.textAreaBtn.addClass(vars['add_line_class']);
                //		inputObj.append($this.textAreaBtn);






                //$this.textarea.append($this.textarea_link);



                $this.textarea.wrap('<div class=""></div>');



                //}else{

                $this.product_fields = $('<div>');

                $this.product_fields.addClass(vars['product_fields_class']);

                $this.product_fields_table = $('<table>');



                $this.product_fields_table.thead = $('<thead>');
                $this.product_fields_table.thead.html('<tr>' +
                        '<td >Part Number</td>' +
                        '<td>Qty</td>' +
                        '</tr>');

                $this.product_fields_table.append($this.product_fields_table.thead);

                $this.product_fields_table.tbody = $('<tbody>');

                $this.product_fields_table.tbody.html('<tr>' +
                        '<td>' +
                        '<input type="text" class="js-field-product-code">' +
                        '</td>' +
                        '<td>' +
                        '<input type="number" class="js-field-product-qty">' +
                        '</td>' +
                        '</tr>');

                $this.product_fields_table.tbody.find('input[type=number]').bind('change', this.updateNumberField);

                $this.product_fields_table.tbody.find('input[type=number]').bind('keydown', this.tabQtyHandle);

                $this.product_fields_table.append($this.product_fields_table.tbody);

                $this.addLineBtn = $('<input>', {value: "Add new Row", type: "button", 'class': "btn hide"}); //hide button, it does not work anyway
                $this.addLineBtn.addClass(vars['add_line_class']);


                $this.product_fields.append($this.product_fields_table);
                $this.product_fields.append($this.addLineBtn);

                inputObj.append($this.product_fields);
                /*
                 if(vars['type'] == 'textarea'){
                 $this.product_fields.addClass('hide');
                 }else{
                 $this.textarea.parent().addClass('hide');
                 }
                 */

                //}

                var topObj = $('.' + vars['basket_top_block_class']);

                $this.purchaseOrder = $('<input>', {type: 'text'});

                var div = $('<div>');

                div.addClass(vars['field_wrapper_class']);
                div.addClass('control-group');
                div.append('<label class="control-label">Purchase Order # </label>');
                div.append($('<div class="controls">'));
                div.find('.controls').append($this.purchaseOrder);

                topObj.append(div);

                $this.promotionCode = $('<input>', {type: 'text'});

                var div = $('<div class="hide">');

                div.addClass(vars['field_wrapper_class']);
                div.addClass('control-group');
                div.append('<label class="control-label">Promotion Code </label>');
                div.append($('<div class="controls">'));
                div.find('.controls').append($this.promotionCode);

                topObj.append(div);

            },
            tabQtyHandle: function(event) {

                if (event.keyCode == 9) {

                    event.preventDefault();

                    $this.addBtn.trigger('click');

                    return false;

                }

            },
            clearProducts: function() {

                var tableObj = $this.find('.' + vars['products_table_class']);

                tableObj.empty();
                $this.products = {};

                var _post = {};

                _post['vid'] = $this.vid;
                _post['mode'] = 'updateBasket';
                _post['iid'] = 0;
                _post['qty'] = 0;

                $.ajax({
                    url: 'basket.ajx',
                    cache: false,
                    context: this,
                    data: _post,
                    success: function(response) {
                    }
                });

            },
            addLine: function() {

                if ($this.product_fields.length == 0)
                    return false;

                var row, cell, input, inputQty, lastCodeField;

                lastCodeField = $this.product_fields.find('.js-field-product-code:last');

                if (lastCodeField.val() == '') {

                    lastCodeField.focus();

                    return false;

                }

                row = $('<tr>');

                cell = $('<td>');

                input = $('<input>', {type: 'text'});
                input.addClass('js-field-product-code');
                cell.append(input);

                row.append(cell);

                cell = $('<td>');

                inputQty = $('<input>', {type: 'number'});
                inputQty.addClass('js-field-product-qty');
                cell.append(inputQty);

                row.append(cell);

                $this.product_fields.find('tbody').append(row);

                input.focus();

            },
            addProducts: function(event) {
                if ($(this).hasClass('disabled'))
                    return false;

                // Griz Start Count number of items in the cart
                var prod = $this.products;
                var prodSize = 0, prodKey;
                for (prodKey in prod) {
                    if (prod.hasOwnProperty(prodKey))
                        prodSize++;
                }

                if (prodSize >= 50) {
                    alert('Cart is full. Cannot add more items');
                    return false;
                }
                // Griz End

                if ($('.modal-body').is(":visible")) {
                    vars['type'] = 'textarea';
                    $this.main_error_obj = $this.textarea;
                    methods.removeFieldError($this.textarea);
                    methods.checkTextarea();
                } else if ($this.product_fields.length > 0) {
                    vars['type'] == 'fields';
                    $this.main_error_obj = $this.product_fields_table;
                    methods.removeFieldError($this.product_fields_table);
                    methods.checkFields();
                } else {
                    alert('Internal error.');
                }

            },
            checkFields: function() {

                var codesFields = $this.product_fields.find('.js-field-product-code'),
                        qtyFields = $this.product_fields.find('.js-field-product-qty'),
                        products = {},
                        error = false,
                        isEmpty = true,
                        __self = this;

                codesFields.each(function(i) {

                    if ($.trim($(this).val()) != '') {

                        var qty = parseInt(qtyFields.eq(i).val()) * 1,
                                code = $.trim($(this).val());

                        //if(qty <= 0 || isNaN(qty))
                        //	qty = 1;


                        if (!$this.codeRegExp.test(code)) {

                            __self.addFieldError($(this), vars['wrong_code_error']);
                            error = true;
                            isEmpty = false;

                        } else {

                            __self.removeFieldError($(this));
                            products[code] = qty;
                            isEmpty = false;

                        }

                    }

                });

                if (isEmpty == true) {

                    this.addFieldError($this.product_fields_table, vars['empty_fields_error']);

                    $this.product_fields_table.find('input[type=text]:eq(0)').focus();

                } else if (error == true) {

                    this.removeFieldError($this.product_fields_table);
                    // error

                } else {

                    this.removeFieldError($this.product_fields_table);
                    this.checkProducts(products);

                }

            },
            checkTextarea: function() {

                var value = $.trim($this.textarea.val()),
                        productLines = [],
                        error = false,
                        i = 0,
                        products = {};

                if (value == '') {

                    $this.textarea.focus();
                    this.addFieldError($this.textarea, vars['empty_textarea_error']);

                } else {

                    this.removeFieldError($this.textarea);

                    productLines = value.split(/\n/);

                    if (productLines.length == 0) {

                        //this.addFieldError($this.textarea, vars['empty_textarea_error']);
                        this.addFieldError($this.find('.js-basket-input'), vars['empty_textarea_error']);

                    } else {

                        this.removeFieldError($this.textarea);

                        var str = '',
                                lastWord = '',
                                firstWord = '',
                                error_key = 'format_textarea_error',
                                j;

                        for (i; i < productLines.length; i += 1) {

                            str = $.trim(productLines[i]);
                            str = $.trim(str.replace(',', ' '));
                            var tmp = str.split(/\s+/);

                            //check that the line does not begin with certain key words (add more if necessary). If it does, go to next line
                            var excludeWordBank = ['Page', 'DealerVu', 'PURCHASE', 'PARTS'];
                            if (excludeWordBank.indexOf(tmp[0]) > -1)
                            {
                                continue;
                            }
                            else if ($('#pohome').hasClass('active'))//home
                            {
//									firstWord = tmp.shift();
//									lastWord = tmp.pop();
//									products[firstWord.trim()] = lastWord.trim();

                            }
                            else if ($('#po1').hasClass('active'))//DealerVue
                            {
                                var productCode, qty, vendor;

                                if (tmp.length >= 4)
                                {
                                    //if no product Code is held, hold a new product Code (until a qty is found)
                                    if (!productCode || productCode == '')
                                    {
                                        productCode = tmp[0];
                                        vendor = tmp[1];

                                        //check if the last character contains vendor and remove from product Code
                                        if (productCode.substring(productCode.length - vendor.length, productCode.length) == vendor)
                                        {
                                            productCode = productCode.slice(0, 0 - tmp[1].length);
                                        }
                                    }

                                    //check that there is a number in the 4th last position, for qty. If there isn't, hold the productCode for another line
                                    if (!isNaN(tmp[tmp.length - 4]))
                                    {
                                        qty = parseInt(tmp[tmp.length - 4]);//set the qty
                                        products[productCode] = qty;//add to products array
                                        productCode = null;//release product code as the next line will include one
                                    }
                                }
                            }
                            else if ($('#po2').hasClass('active'))//Lightspeed
                            {
                                //temporarily hold product code until matching quantity is found
                                var productCode;

                                if (!productCode || productCode == '')
                                {
                                    productCode = tmp[0];
                                }

                                if (tmp.length >= 3)
                                {
                                    if (tmp[tmp.length - 1].indexOf("$") !== -1)
                                    {
                                        products[productCode] = parseInt(tmp[tmp.length - 3]);
                                        productCode = '';
                                    }
                                    else if (tmp[tmp.length - 2].indexOf("$") !== -1)
                                    {
                                        products[productCode] = parseInt(tmp[tmp.length - 4]);
                                        productCode = '';
                                    }
                                    else if (tmp[tmp.length - 3].indexOf("$") !== -1)
                                    {
                                        products[productCode] = parseInt(tmp[tmp.length - 5]);
                                        productCode = '';
                                    }
                                }
                            }
                            else if ($('#po3').hasClass('active'))//Quickbooks
                            {
                                products[tmp[0]] = parseInt(tmp[tmp.length - 3]);
                            }
                            else if ($('#po4').hasClass('active') || $('#po5').hasClass('active'))//Galaxy V2 & V3
                            {
                                if (i == 0)
                                {
                                    var currentRow = tmp[0] - 1;
                                }

                                if (tmp[0] == currentRow + 1)
                                {
                                    products[tmp[1]] = parseInt(tmp[2]);
                                    currentRow += 1;
                                }
                            }
                            else if ($('#po6').hasClass('active'))//Total Control
                            {
                                if (tmp.length > 3)
                                {
                                    products[tmp[0]] = parseInt(tmp[tmp.length - 3]);
                                }
                            }
                            else if ($('#po7').hasClass('active'))//Tab Delim
                            {
                                firstWord = tmp.shift();
                                lastWord = tmp.pop();
                                products[$.trim(firstWord)] = $.trim(lastWord);
                            }
                            else
                            {
                                console.log("Selection error");
                            }

                            /*
                             if(/^[a-zA-Z0-9-\._\s]+.*[0-9]+$/i.test(str)){
                             
                             var tmp = str.split(/\s+/);
                             
                             firstWord = tmp.shift();
                             lastWord = tmp.pop();
                             
                             if(lastWord > 0){
                             products[firstWord.trim()] = lastWord.trim();
                             }else{
                             
                             lastWord = 0;
                             
                             j = 0;
                             for(j; j < tmp.length; j+=1){
                             
                             if(parseInt(tmp[j]) > 0)
                             lastWord = parseInt(tmp[j]);
                             
                             }
                             
                             if(lastWord > 0){
                             products[firstWord.trim()] = lastWord;
                             }else{
                             error = true;
                             }
                             
                             }
                             
                             }else if(/^[a-zA-Z0-9-\._]+$/i.test(str)){
                             
                             products[productLines[i]] = 1;
                             
                             }else{
                             
                             
                             if(/^[a-zA-Z0-9-\._]+.*[a-z]+$/i.test(str))
                             error_key = 'format_textarea_qty_error';
                             
                             error = true;
                             
                             }
                             */
                        } //end for [productLines]

                        //if(error === true){

                        //	this.addFieldError($this.textarea, vars[error_key]);

                        //	$this.textarea.focus();

                        //}else{

                        this.removeFieldError($this.textarea);

                        this.checkProducts(products);

                        //}

                    }

                }

            },
            checkProducts: function(products) {

                var itemId = [],
                        itemsCodes = [],
                        i,
                        count = 0,
                        //regExp = /^[0-9]+\.[0-9]{2,}$/i
                        regExp = /^[0-9]+$/i;

                for (i in products) {

                    if ($this.products[i]) {
                        this.addFieldError($this.main_error_obj, vars['duplicate_error'].replace('$id', i));
                        return false;
                    }

                    if (!isNaN(parseInt(i)) && regExp.test(i)) {
                        itemId.push(i);
                    } else {
                        //itemsCodes.push(i.replace('.', '_'));
                        itemsCodes.push(i.replace('.', '-'));
                    }

                    count++;

                }


                this.removeFieldError($this.main_error_obj);

                $this.addBtn.addClass('disabled');
                $this.addBtn.find('span').text(vars['loading_label']);

                var _post = {
                    vid: $this.vid
                };

                if (itemId.length > 0)
                    _post['itemid'] = itemId.join(',');

                if (itemsCodes.length > 0)
                    _post['itemcode'] = itemsCodes.join(',');

                methods.hideMainError();

                $.ajax({
                    url: 'getitems.ajx',
                    cache: false,
                    context: this,
                    data: _post,
                    success: function(response) {

                        $this.addBtn.removeClass('disabled');
                        $this.addBtn.find('span').text(vars['add_cart_label']);

                        var json = $.parseJSON(response);

                        if (json['__Success'] == 'false') {

                            this.addFieldError($this.main_error_obj, json['__Message']);

                        } else {

                            var productsData = json['__Result'],
                                    productsCnt = productsData.length;


                            if (productsCnt == 0) {

                                this.addFieldError($this.main_error_obj, vars['products_not_found_error']);
                            } else {


                                //if(productsData.length != count){
                                //this.checkDifference(productsData, products);
                                //}else{
                                if (this.checkDifference(productsData, products)) {
                                    this.clearFields();
                                    this.buildProductsTable(productsData, products);
                                    $('#example').modal('hide');
                                }

                            }

                        }

                    }
                });
            },
            clearFields: function() {

                if (vars['type'] == 'textarea') {

                    $this.textarea.val('');

                } else {

                    $this.product_fields.find('tbody tr').each(function(i) {

                        if (i > 0)
                            $(this).remove();

                    });

                    $this.product_fields.find('input[type=text]').val('');
                    $this.product_fields.find('input[type=number]').val('');
                    $this.product_fields.find('input[type=text]').focus();

                }

            },
            checkDifference: function(productsData, products) {
                //NOTE: var noError will stop ALL items being added to cart if error found. If disabled, errors will still show but items without errors will be added
                this.removeFieldError($this.find('.' + vars['input_obj_class']));
                var noError = true;
                var count = 1;
                for (product in products) {
                    var productNotFound = true;
                    for (var i = 0; i < productsData.length; i++) {
                        var productCode = (productsData[i].code).replace("-", ".");

                        if (productCode == product) {
                            productNotFound = false;
                            if (products[product] <= 0 || isNaN(products[product])) {
                                //noError = false;
                                this.addFieldError($this.parentsUntil('body').find('.' + vars['input_obj_class']),
                                        "Line " + count + ": Product " + product + ", please enter a valid quantity!");
                            } else if (productsData[i].invs[0].instock < products[product]) {
                                //noError = false;
                                this.addFieldError($this.parentsUntil('body').find('.' + vars['input_obj_class']),
                                        "Line " + count + ": Product " + product + ", ordered " + products[product] +
                                        " but only " + productsData[i].invs[0].instock + " in stock!");
                            }
                        }
                    }
                    if (productNotFound) {
                        //noError = false;
                        this.addFieldError($this.parentsUntil('body').find('.' + vars['input_obj_class']), "Line " + count + ": Product " + product + " not found!");
                    }
                    count++;
                }

                return noError;
            },
            loadBasket: function() {
                $.ajax({
                    url: 'basket.ajx',
                    cache: false,
                    context: this,
                    dataType: 'json',
                    data: {vid: $this.vid},
                    success: function(response) {
                        var json, productsData, len;
                        try {
                            //json = $.parseJSON(response);
                            json = response;
                            productsData = json['__Result'];
                            len = productsData.basketItems.length;
                        } catch (e) {
                            json = eval('(' + response + ')');
                        }

                        var i = 0,
                                tableObj = $this.find('.' + vars['products_table_class']),
                                table = (tableObj.find('table:eq(0)').length > 0) ? tableObj.find('table:eq(0)') : $('<table class="table">', {cellpadding: '0', cellspacing: '0'}),
                                row,
                                cell,
                                removeLink,
                                qtyInput,
                                price,
                                qty = 0,
                                imgPath;


                        if (len == 0 || !len)
                            return false;

                        this.buildShippingGroupDrop();


                        if (table.find('thead:eq(0)').length == 0) {
                            table.append(this.getTabletHead);
                        }

                        if (table.find('tbody').length == 0) {
                            var tbody = $('<tbody>');
                        } else {
                            var tbody = table.find('tbody:eq(0)');
                        }

                        for (i; i < len; i += 1) {

                            row = $('<tr>');

                            row.attr('data-code', productsData.basketItems[i]['itemId']);

                            cell = $('<td>');
// temp sart
//										number = productsData.basketItems[i]['compCode'];
//
//											cell.attr('data-code', productsData.basketItems[i] ['compCode']);
//											cell.html(
//												'<a href="#"' + productsData.basketItems[i] ['compCode'] + '</a>'
//												);
//											row.append(cell);
// temp end

                            cell = $('<td class="thumbs">');

                            imgPath = (productsData.basketItems[i]['cImage'].indexOf('http') == 0) ? productsData.basketItems[i]['cImage'] : 'store' + productsData.basketItems[i]['cImage'];

                            cell.html('<img src="' + imgPath + '">');
                            row.append(cell);

                            cell = $('<td>');
                            cell.html(
                                    '<a href="store.html?vid=20120606532&iid=' + productsData.basketItems[i]['itemId'] + '">' + productsData.basketItems[i]['title'] + '</a>' +
                                    '<p>' + 'Part Number: ' + productsData.basketItems[i]['compCode'].replace('-', '.') + '</p>'
                                    );
                            row.append(cell);
//
                            cell = $('<td>');
                            price = Number(productsData.basketItems[i]['listPrice']).toFixed(2);

                            cell.attr('data-msrp', productsData.basketItems[i]['itemId']);
                            cell.html($this.currencySign + price);
                            row.append(cell);


                            cell = $('<td>');
                            price = Number(productsData.basketItems[i]['price']).toFixed(2);

                            cell.attr('data-price', productsData.basketItems[i]['itemId']);
                            cell.html($this.currencySign + price);
                            row.append(cell);

                            cell = $('<td>');

                            qty = productsData.basketItems[i]['qty'];

                            qtyInput = $('<input>', {type: 'number', value: qty});

                            qtyInput.data('code', productsData.basketItems[i]['itemId']);
                            qtyInput.data('callback', this.buildShippingGroupDrop);
                            //qtyInput.bind('blur', this.updateQty);

                            qtyInput.bind('change', this.updateNumberField);
                            qtyInput.bind('change', this.updateQty);

                            cell.attr('data-qty', productsData.basketItems[i]['itemId']);
                            cell.addClass('qty');

                            cell.append(qtyInput);

                            row.append(cell);

                            cell = $('<td>');
                            price = productsData.basketItems[i]['totalPrice'];

                            cell.attr('data-item-total', productsData.basketItems[i]['itemId']);
                            cell.html($this.currencySign + Number(price).toFixed(2));
                            //			row.append(cell);
                            //					'<p>' + productsData[i]['totalPrice'] +'</p>' +

                            row.append(cell);


                            cell = $('<td>');

                            removeLink = $('<a>', {href: 'javascript:void(0)', html: 'Remove'});
                            cell.append(removeLink);

                            removeLink.data('code', productsData.basketItems[i]['itemId']);
                            removeLink.data('callback', this.buildShippingGroupDrop);
                            removeLink.bind('click', this.removeProduct);

                            row.append(cell);

                            tbody.append(row);

                            ////////
                            $this.itemsData[productsData.basketItems[i]['itemId']] = {};

                            //CHANGED: the following was '... = price'; it is now '... = price / qty'
                            if (isNaN(price))
                                $this.itemsData[productsData.basketItems[i]['itemId']]['price'] = price.replace(/\$|,/g, '') / qty;
                            else
                                $this.itemsData[productsData.basketItems[i]['itemId']]['price'] = price / qty;

                            $this.products[productsData.basketItems[i]['itemId']] = qty;

                        } //end for

                        if (tableObj.find('table:eq(0)').length == 0 && row) {

                            table.append(tbody);

                            tableObj.append(table);


                            var placeOrderBtn = $('<input>', {type: 'button', 'class': 'btn btn-success', value: vars['place_order_label']});
                            var checkoutStepBtn = $('<input>', {type: 'button', 'class': 'btn btn-primary', 'id': 'stepbutton', value: vars['checkout_label']});
                            var helpLink = $('<a><b>Which one ? </b></a>');

                            buttons = $('<div class="span12 form-actions">');
                            col = $('<div class="span2 offset8">' + checkoutStepBtn);
                            col.append(placeOrderBtn, checkoutStepBtn);

                            buttons.append(col);

                            col = $('<div class="span2">');
                            col.append(helpLink);
                            buttons.append(col);

                            tableObj.append(buttons);

                            placeOrderBtn.wrap('<p>');
                            checkoutStepBtn.wrap('<p>');

                            checkoutStepBtn.bind('click', function() {
                                window.location.href = '/basket.html?vid=20120606532';
                            });
                            placeOrderBtn.bind('click', this.placeOrder);
                            helpLink.bind('click', this.showShipNotice);

                            var tfoot = $('<tfoot class="checkout-total">');

                            table.append(tfoot);

                            row = $('<tr>');

                            cell = $('<td>', {colspan: 4});
                            row.append(cell);

                            cell = $('<td>', {colspan: 1, html: '<strong>Total:</strong>', align: 'right'});
                            row.append(cell);

                            cell = $('<td>', {colspan: 1});

                            cell.html(methods.getTotal());
                            cell.attr('data-total', 'true');
                            row.append(cell);

                            cell = $('<td>', {colspan: 1});
                            row.append(cell);

                            tfoot.append(row);

                        }


                    }
                });


            },
            getTabletHead: function() {

                return '<thead><tr>' +
                        '<th colspan=2> Description</th>' +
                        '<th> MSRP</th>' +
                        '<th> Dealer</th>' +
                        '<th> Qty.</th>' +
                        '<th> Total</th>' +
                        '<th></th>' +
                        '</tr></thead>';

            },
            getTableFoot: function() {
                return 'teting syntax';
            },
            buildProductsTable: function(productsData, products) {

                var tableObj = $this.find('.' + vars['products_table_class']),
                        len = productsData.length,
                        table = (tableObj.find('table:eq(0)').length > 0) ? tableObj.find('table:eq(0)') : $('<table class="table">', {cellpadding: '0', cellspacing: '0'}),
                        i = 0,
                        row,
                        cell,
                        notAvailableProducts = [],
                        newItems = {},
                        imgPath;

                if (table.find('thead:eq(0)').length == 0) {
                    table.append(this.getTabletHead);
                }

                if (table.find('tbody').length == 0) {
                    var tbody = $('<tbody>');
                } else {
                    var tbody = table.find('tbody:eq(0)');
                }

                for (i; i < len; i += 1) {

                    var qty = 1, codeFields = 'itemid';
                    var itemcode = productsData[i]['code'].replace('-', '.');

                    if (products[productsData[i]['itemid']]) {
                        qty = products[productsData[i]['itemid']];
                    } else if (products[itemcode]) {
                        qty = products[itemcode];
                        codeFields = 'code';
                    }


                    if (productsData[i]['attributes'].length > 0 || productsData[i]['available'] == false) {

                        productsData[i]['qty'] = qty;
                        notAvailableProducts.push(productsData[i]);
                        continue;

                    }

                    $this.itemsData[productsData[i]['itemid']] = {
                        discount: productsData[i]['discount'],
                        prices: productsData[i]['prices']
                    };

                    var price = methods.getPrice(productsData[i]['itemid'], qty);

                    if (isNaN(price))
                        $this.itemsData[productsData[i]['itemid']]['price'] = price.replace(/\$|,/g, '') / qty;
                    else
                        $this.itemsData[productsData[i]['itemid']]['price'] = price / qty;

                    if ($this.products[productsData[i]['itemid']]) {

                        newItems[productsData[i]['itemid']] = qty;

                        qty = table.find('tr[data-code=' + productsData[i]['itemid'] + ']').find('.qty input').val() * 1 + parseInt(qty);

                        table.find('tr[data-code=' + productsData[i]['itemid'] + ']').find('.qty input').val(qty);

                        $this.products[productsData[i]['itemid']] = qty;

                        continue;

                    }

                    $this.products[productsData[i]['itemid']] = qty;

                    newItems[productsData[i]['itemid']] = qty;

                    row = $('<tr>');

                    row.attr('data-code', productsData[i]['itemid']);

// JP -------------------
//							cell = $('<td>');
//
//								number = productsData[i]['code'];
//
//									cell.attr('data-code', productsData[i] ['code']);
//									cell.html(
//												'</b>' + productsData[i] ['code'] + '</b>'
//												);
//								row.append(cell);
//
// ----------------------
                    cell = $('<td class="thumbs">');

                    imgPath = (productsData[i]['cimage'].indexOf('http:') == 0) ? productsData[i]['cimage'] : 'store/' + $this.vid + '/assets/items/thumbnails/' + productsData[i]['cimage'].substr(productsData[i]['cimage'].lastIndexOf("/") + 1);

                    cell.html('<img src="' + imgPath + '">');
                    row.append(cell);

                    cell = $('<td>');
                    /*
                     cell.html(
                     '<a href="#">' + productsData[i]['title'] + '</a>' +
                     '<p>' + 'Part Number: '+ productsData[i]['code'].replace('-','.') + '</p>' +
                     '<p>' + productsData[i]['shortdesc'] + '</p>'
                     );
                     row.append(cell);
                     */
                    var content = '<a href="store.html?vid=20120606532&iid=' + productsData[i]['itemid'] + '">' + productsData[i]['title'] + '</a>' +
                            '<p>' + 'Part Number: ' + productsData[i]['code'].replace('-', '.') + '</p>' +
                            '<p>' + productsData[i]['shortdesc'] + '</p>';

                    if (products[itemcode] <= 0 || isNaN(products[itemcode])) {
                        content = content + "<div class='alert alert-error js-basket-error'>" +
                                "Please enter a valid quantity!</div>";
                    } else if (productsData[i].invs[0].instock < products[itemcode]) {
                        content = content + "<div class='alert alert-error js-basket-error'>" +
                                "Ordered " + products[itemcode] +
                                " but only " + productsData[i].invs[0].instock + " in stock!</div>";
                    }
                    cell.html(content);
                    row.append(cell);

                    cell = $('<td>');

                    listPrice = Number(productsData[i]['prices'][0]['listprice']).toFixed(2);
                    cell.attr('data-msrp', productsData[i]['itemId']);
                    cell.html($this.currencySign + listPrice);
                    row.append(cell);

                    cell = $('<td>');

                    cell.attr('data-price', productsData[i]['itemid']);
                    cell.html(price);
                    row.append(cell);

                    cell = $('<td>');


                    var qtyInput = $('<input>', {type: 'number', value: qty});

                    qtyInput.data('code', productsData[i]['itemid']);
                    qtyInput.data('callback', this.buildShippingGroupDrop);
                    //qtyInput.bind('blur', this.updateQty);

                    qtyInput.bind('change', this.updateNumberField);
                    qtyInput.bind('change', this.updateQty);

                    cell.addClass('qty');

                    cell.append(qtyInput);

                    //cell.append('<br>');

                    /*var updateLink = $('<a>', { href: 'javascript:void(0)', html: 'Update' });
                     cell.append(updateLink);
                     cell.append('<br>');*/

                    row.append(cell);

                    cell = $('<td>');
                    var itemTotal = parseFloat(price.replace(/\$|,/g, '') * qty).toFixed(2);
                    cell.attr('data-item-total', productsData[i]['itemid']);
                    cell.html($this.currencySign + itemTotal);
                    row.append(cell);

                    cell = $('<td>');

                    var removeLink = $('<a>', {href: 'javascript:void(0)', html: 'Remove'});
                    cell.append(removeLink);

                    removeLink.data('code', productsData[i]['itemid']);
                    removeLink.data('callback', this.buildShippingGroupDrop);
                    removeLink.bind('click', this.removeProduct);

                    row.append(cell);

                    tbody.append(row);

                } // end for

                if (notAvailableProducts.length > 0)
                    this.checkNotAvailableProducts(notAvailableProducts);

                // Sync
                this.syncMainBasket(newItems);

                if (tableObj.find('table:eq(0)').length == 0 && row) {

                    table.append(tbody);

                    tableObj.append(table);

                    var placeOrderBtn = $('<input>', {type: 'button', 'class': 'btn btn-success', value: vars['place_order_label']});
                    var checkoutStepBtn = $('<input>', {type: 'button', 'class': 'btn btn-primary', value: vars['checkout_label']});
                    var helpLink = $('<a><b>Which one ? </b></a>');

                    buttons = $('<div class="span12 form-actions">');
                    col = $('<div class="span2 offset8">' + checkoutStepBtn);
                    col.append(placeOrderBtn, checkoutStepBtn);

                    buttons.append(col);

                    col = $('<div class="span2">');
                    col.append(helpLink);
                    buttons.append(col);

                    tableObj.append(buttons);

                    placeOrderBtn.wrap('<p>');
                    checkoutStepBtn.wrap('<p>');

                    checkoutStepBtn.bind('click', function() {
                        window.location.href = '/basket.html?vid=20120606532';
                    });
                    placeOrderBtn.bind('click', this.placeOrder);
                    helpLink.bind('click', this.showShipNotice);

                    var tfoot = $('<tfoot class="checkout-total">');

                    table.append(tfoot);

                    row = $('<tr>');

                    cell = $('<td>', {colspan: 4});
                    row.append(cell);

                    cell = $('<td>', {colspan: 1, html: '<strong>Total:</strong>', align: 'right'});
                    row.append(cell);

                    cell = $('<td>', {colspan: 1});

                    cell.html(methods.getTotal());
                    cell.attr('data-total', 'true');
                    row.append(cell);

                    cell = $('<td>', {colspan: 1});
                    row.append(cell);


                    tfoot.append(row);

                } else
                    methods.updateTotal();

            },
            syncMainBasket: function(items) {

                var _post = {},
                        i,
                        cnt = 1;

                _post['vid'] = $this.vid;
                //_post['url'] = 'basket.html';
                _post['mode'] = 'addItems';
                _post['return'] = 'json';

                for (i in items) {

                    _post['iid' + cnt] = i;
                    _post['qty' + cnt] = items[i];

                    cnt += 1;

                }

                if (cnt > 1) {
                    jQuery.ajax({
                        url: 'action.html',
                        cache: false,
                        context: this,
                        dataType: 'json',
                        data: _post,
                        success: function(response) {

                            var json = response,
                                    result = json['result'],
                                    len = result.length,
                                    i = 0;

                            if (json['__Success'] == 'true') {

                                for (i; i < len; i += 1) {

                                    if (result[i]['status'] != 200) {

                                        methods.showMainError(result[i]['messgae']);
                                        jQuery('td[data-code=' + _post['iid' + (i + 1)] + ']').remove();

                                    }

                                }

                            }
                            this.buildShippingGroupDrop();
                        }
                    });
                }

            },
            buildShippingGroupDrop: function() {

                var _post = {};
                _post['vid'] = $this.vid;

                jQuery.ajax({
                    url: 'getshippinggroup.ajx',
                    cache: false,
                    context: this,
                    data: _post,
                    dataType: 'json',
                    success: function(response) {
                        if (response['__Success'] == 'true') {
                            var groups = response['__Result'];
                            var topObj = $('.js-basket-top');

                            $this.shippingGroups.length = 0;
                            $('.shipping-group').remove();

                            if (!groups || groups.length == 0) {
                                return;
                            }


                            var div = $('<div>');

                            div.addClass('js-basket-field-wrapper');
                            div.addClass('control-group');
                            div.addClass('shipping-group');
                            div.append('<label class="control-label">Shipping Method:</label>');
                            div.append($('<div class="controls">'));

                            for (var i = 0; i < groups.length; i += 1) {
                                var shippingGroup = $('<select>', {name: groups[i].name, id: groups[i].name});

                                for (var j = 0; j < groups[i].methods.length; j++) {
                                    if (groups[i].methods[j].check) {
                                        shippingGroup.append('<option value="' + groups[i].methods[j].methodid + '" selected>' + groups[i].methods[j].name + '</option>');
                                    } else {
                                        shippingGroup.append('<option value="' + groups[i].methods[j].methodid + '">' + groups[i].methods[j].name + '</option>');
                                    }
                                }

                                div.append(shippingGroup);
                                $this.shippingGroups[$this.shippingGroups.length] = shippingGroup;
                            }
                            topObj.append(div);
                        }

                    }
                });

            },
            checkNotAvailableProducts: function(products) {

                var i = 0,
                        len = products.length,
                        code,
                        _post = {};

                for (i; i < len; i += 1) {

                    code = products[i]['code'];

                    _post = {
                        vid: $this.vid,
                        ic: code,
                        qty: products[i]['qty']
                    };


                    $.ajax({
                        url: 'checkitem.ajx',
                        cache: false,
                        context: products[i],
                        data: _post,
                        success: function(response) {

                            var json = $.parseJSON(response);

                            if (json['__Success'] == 'false') {
                                methods.showMainError(this.title + ', ' + code + ': ' + json['__Message']);
                            }

                            if (vars['type'] == 'textarea') {

                                $this.textarea.focus();

                            } else {

                                $this.product_fields.find('.js-field-product-code:last').focus();

                            }

                        }
                    });

                } // end for

            },
            showTest: function() {
                //bootbox.alert("hellow NWS");	

                var head = '<div class="modal-header"> <h3> Order Shipping Notice </h3></div>';
                var junk = '<p>Use the green \"Place Order\" button to instanly place your order. (this option assumes that your Bill To and Ship To adress are the  same.)</p>';
                var junk2 = '<p>If your Shipping Address is <b>NOT</b> the same as your Billing Address, use the blue \"Continue to Checkout\" button. This will  allow you to select a predertermined shipping address or add a new dropship address.</p>';

                bootbox.dialog(head + "Please, select your order shipping option:" + junk + junk2, [{
                        "label": "Cancel",
                        "class": "",
                        "callback": function() {
                            console.log("close modal");
                        }
                    }, {
                        "label": "Continue to Checkout",
                        "class": "btn-primary",
                        "callback": function() {
                            window.location.href = 'basket.html?vid=20120606532';
                        }
                    }, {
                        "label": "Place Order",
                        "id": "placeOrderBtn",
                        "class": "btn-success james",
                        "callback": function() {
                            $('a.btn.btn-success.james').bind('click', $this.placeOrder);
                            //      methods.placeOrder;
                            //      console.log(" i clicked the button");
                            //       placeOrderBtn.bind('click', this.placeOrder);
                            //       console.log("quick order! ( using the defaults) ");
                        }
                    }]);

            },
            showMainError: function(html) {

                var errorObj = $this.find('.' + vars['main_error_class']),
                        div = $('<div>');

                if (errorObj.length == 0) {

                    errorObj = $('<div>');

                    errorObj.addClass(vars['main_error_class']);

                    $this.find('.' + vars['input_obj_class']).after(errorObj);

                }

                div.html(html);

                errorObj.append(div);

            },
            hideMainError: function() {

                var errorObj = $this.find('.' + vars['main_error_class']);

                errorObj.remove();

            },
            getPrice: function(item_id, qty) {

                var obj = $this.itemsData[item_id];

                if (typeof (obj['price']) != 'undefined')
                    return obj['price'];

                if (obj['prices'].length == 0)
                    return false;


                var price = obj['prices'][0];

                var currency = new Commerce.Domain.Currency($this.vid, price['currencyid']);

                var amount = 0;
                if (price.qty_1 == 0 || price.qty_1 >= qty) {

                    amount = price.price_1 + price.setup;

                } else if (price.qty_2 == 0 || price.qty_2 >= qty) {

                    amount = price.price_2 + price.setup;

                } else if (price.qty_3 == 0 || price.qty_3 >= qty) {

                    amount = price.price_3 + price.setup;

                } else if (price.qty_4 == 0 || price.qty_4 >= qty) {

                    amount = price.price_4 + price.setup;

                } else {

                    amount = price.price_5 + price.setup;

                }
                if (amount == 0) {
                    amount = price.price_1 + price.setup;
                }

                if (!$this.currencySign || $this.currencyId != price['currencyid']) {
                    $this.currencySign = currency['domain']['sign'];
                    $this.currencyId = price['currencyid']
                }

                return currency['domain']['sign'] + (amount - Math.round((amount * obj.discount) * 100) / 100).toFixed(2);

            },
            showShipNotice: function() {

                var shipmessage_html = {
                    'head': '<h3> Order Shipping Notice </h3>',
                    'subhead': '<h4>Please, select your order shipping option:</h4>',
                    'message_1': 'Use the green <span class="btn btn-small btn-success"> Place Order</span> button to instanly place your order. (this option assumes that your Bill To and Ship To adress are the  same.)',
                    'message_2': 'If your Shipping Address is <b>NOT</b> the same as your Billing Address, use the blue <span class="btn btn-small btn-primary">Continue to Checkout</span> button. This will  allow you to select a predertermined shipping address or add a new dropship address.'
                };
                //	var title = '<div class="modal-header">' + shipmessage_html.head + '</div>';
                var _html =
                        '<div class="modal-body">' + shipmessage_html.head + shipmessage_html.subhead +
                        '<p>' + shipmessage_html.message_1 + '</p>' +
                        '<p>' + shipmessage_html.message_2 + '</p>' +
                        '</div>';

                bootbox.dialog(_html,
                        {
                            "label": "Got It",
                            "class": "btn btn-primary",
                            "callback": function() {
                                console.log("close modal");
                            }
                        });

            },
            placeOrder: function(event) {

//if (confirm('Pressing the green Place Order Button will assume that your Billing and Shipping Addresses are the same. To change your Shipping address, pres cancel then use the "continue to Checkout Button" at the botom of your order')) {

                var _post = {},
                        i,
                        cnt = 1,
                        thisBtn = $(this);

                if ($this.purchaseOrder.val() == '') {

                    methods.addFieldError($this.purchaseOrder, vars['purchase_error']);
                    $this.purchaseOrder.focus();
                    return false;

                } else {

                    methods.removeFieldError($this.purchaseOrder);

                }
                // TESTING

$('#stepbutton').hide();





                thisBtn
                        .val(vars['process_order_label'])
                        .attr('disabled', 'disabled');

                _post['vid'] = $this.vid;
                _post['promocode'] = $this.promotionCode.val();
                _post['redirect'] = 'y';
                _post['paymentmethod'] = 'NCC-PO';
                _post['po'] = $this.purchaseOrder.val();

                for (var j = 0; j < $this.shippingGroups.length; j++) {
                    var group = $this.shippingGroups[j];
                    _post[group.attr('name')] = group.val();
                }

                for (i in $this.products) {

                    //_post['iid' + cnt] = i;
                    //_post['qty' + cnt] = $this.products[i];

                    cnt += 1;

                }


                $.ajax({
                    url: 'checkout.ajx',
                    cache: false,
                    context: this,
                    data: _post,
                    success: function(response) {

                        var json = $.parseJSON(response);

                        thisBtn
                                .val(vars['place_order_label'])
                                .attr('disabled', '');

                        switch (json['status'])
                        {
                            case '200':

                                if (json['redirecturl'] != '') {
                                    var wait = 2000; //redirect interval
                                    setTimeout(function() {
                                        document.location.href = json['redirecturl']
                                    }, wait);
                                    // document.location.href = json['redirecturl'];

                                } else {

                                    methods.showMessage(json['msg']);

                                }

                                break;
                            case '500':
                                methods.showMessage(json['msg']);
                                break;
                            case '501':
                                methods.showMessage(json['msg']);
                                break;
                            case '502':
                                methods.showMessage(json['msg']);
                                break;
                            default:
                                alert('Internal error');
                                break;
                        }

                    }
                });
// uncommentline s to reinstate confirm function
// } else {
// exit;
// }

            },
            showMessage: function(html) {

                var modal = $('<div>'),
                        modalInner = $('<div>'),
                        closeIcon = $('<a>', {href: 'javascript:void(0)'}),
                        okBtn = $('<input>', {type: 'button', value: 'Ok'});

                modal.addClass(vars['popup_window_class']);

                closeIcon.bind('click', methods.hideMessage);
                closeIcon.addClass('close');

                modal.append(closeIcon);

                modalInner.addClass(vars['popup_window_inner_class']);

                modalInner.html(html);

                var div = $('<div>');
                div.css('text-align', 'center');
                div.css('padding-top', '15px');
                div.append(okBtn);

                okBtn.bind('click', methods.hideMessage);

                modal.append(modalInner);
                modal.append(div);

                var disableScreen = $('<div>');

                disableScreen.addClass(vars['disable_screen_class']);

                disableScreen.css('height', $(document).height());

                $('body').append(modal);
                $('body').append(disableScreen);

            },
            showShipMessage: function() {

                var modal = $('<div id=\"shipToModal\" class=\"modal hide fade\">'),
                        modalHeader = $('<div class=\"modal-header\">'),
                        modalInner = $('<div class=\"modal-body\">'),
                        modalFooter = $('<div class=\"modal-footer\"');

                modalInner.html("this is a test of a new modal");

                var div = $('<div>');

                modal.append(modalHeader);
                modal.append(modalInner);
                modal.append(div);
                modal.append(modalFooter);

                $('body').append(modal);
        },
            hideMessage: function() {

                $('.' + vars['popup_window_class']).remove();
                $('.' + vars['disable_screen_class']).remove();

            },
            updateQty: function() {

                var qty = $(this).val();

                var price = methods.getPrice($(this).data('code'), qty);

                var itemTotal = parseFloat((price) * qty).toFixed(2);

                console.log("Price: " + price + " | Item Total: " + itemTotal);

                $('td[data-item-total=' + $(this).data('code') + ']').text($this.currencySign + itemTotal.toString(2));

                var _post = {};

                _post['vid'] = $this.vid;
                _post['mode'] = 'updateBasket';
                _post['iid'] = $(this).data('code');
                _post['qty'] = $(this).val();

                var callback = $(this).data('callback');

                $.ajax({
                    url: 'basket.ajx',
                    cache: false,
                    context: this,
                    data: _post,
                    success: function(response) {
                        callback.call(this);
                    }
                });

                //$this.itemsData[$(this).data('code')]['price'] = price;

                $this.products[$(this).data('code')] = $(this).val();

                methods.updateTotal();

            },
            updateTotal: function() {

                $('td[data-total=true], .mini-basket-total').text(methods.getTotal());

            },
            getTotal: function() {

                var i, total = 0;

                for (i in $this.itemsData) {
                    if ($this.itemsData[i]['price'].constructor.name && $this.itemsData[i]['price'].constructor.name.toLowerCase() == 'number') {
                        total += $this.itemsData[i]['price'] * $this.products[i];
                    } else {
                        total += $this.itemsData[i]['price'].toString().match('[0-9\.]+')[0] * 1 * $this.products[i];
                    }

                }

                return $this.currencySign + total.toFixed(2);

            },
            removeProduct: function() {

                if (!confirm(vars['remove_confirm']))
                    return false;

                var _post = {};

                _post['vid'] = $this.vid;
                _post['mode'] = 'updateBasket';
                _post['iid'] = $(this).data('code');
                _post['qty'] = 0;

                var callback = $(this).data('callback');

                $.ajax({
                    url: 'basket.ajx',
                    cache: false,
                    context: this,
                    data: _post,
                    success: function(response) {
                        callback.call(this);
                    }
                });

                delete $this.products[$(this).data('code')];
                delete $this.itemsData[$(this).data('code')];
                $(this).parents('tr:eq(0)').remove();

                methods.updateTotal();

            },
            updateNumberField: function() {

                if ($(this).val() <= 0)
                    $(this).val('1');

            },
            addFieldError: function(el, text) {
                el.addClass(vars['error_class']);

                //if(el.parent().find('div.' + vars['error_class']).length > 0){
                //	el.parent().find('div.' + vars['error_class']).html(text);
                //}else{
                el.after('<div class="alert alert-error ' + vars['error_class'] + '">' + text + '</div>');
                //}

            },
            removeFieldError: function(el) {
                el.removeClass(vars['error_class']);
                el.parent().children('div.' + vars['error_class']).remove();
            },
            addIndexOf: function() {
                if (!Array.prototype.indexOf)
                {
                    Array.prototype.indexOf = function(elt /*, from*/)
                    {
                        var len = this.length >>> 0;

                        var from = Number(arguments[1]) || 0;
                        from = (from < 0)
                                ? Math.ceil(from)
                                : Math.floor(from);
                        if (from < 0)
                            from += len;

                        for (; from < len; from++)
                        {
                            if (from in this &&
                                    this[from] === elt)
                                return from;
                        }
                        return -1;
                    };
                }
            }

        };

        methods.init();

    };

    $.jsbasket.defaults = {
        type: 'fields', // can be also set to textarea

        basket_top_block_class: 'js-basket-top',
        main_error_class: 'js-basket-main-error',
        input_obj_class: 'js-basket-input',
        add_btn_class: 'js-basket-add-btn',
        clear_btn_class: 'js-basket-clear',
        textarea_class: 'js-basket-textarea',
        products_table_class: 'js-basket-products',
        product_fields_class: 'js-basket-fields',
        add_line_class: 'js-basket-add-line',
        po_transfer_btn: 'js-basket-po-transfer-btn',
        field_wrapper_class: 'js-basket-field-wrapper',
        error_class: 'js-basket-error',
        popup_window_class: 'js-basket-popup',
        disable_screen_class: 'js-basket-disable-screen',
        popup_window_inner_class: 'js-basket-popup-inner',
        empty_textarea_error: 'Please enter products in the above input',
        empty_fields_error: 'Please enter a NWS part number',
        format_textarea_error: 'Sorry, the data you pasted is not formatted correctly as: product code, optional  description followed by quantity',
        format_textarea_qty_error: 'Please use a numeric value for Qty.',
        duplicate_error: 'The product: $id is already in the basket',
        products_not_found_error: 'Products not found',
        wrong_code_error: 'Wrong code',
        purchase_error: 'Purchase Order is Required',
        textarea_switch_label: 'Paste products and quantities',
        fields_switch_label: 'Build order line by line',
        remove_confirm: 'Are you sure to want to remove product from basket?',
        loading_label: 'Loading',
        add_cart_label: 'Add To Cart',
        place_order_label: 'Place Order',
        checkout_label: 'Continue to Checkout',
        process_order_label: 'Please wait'

                //	add_sample_class		:'js-basket-sample-help';

    }

    $.fn.jsbasket = function(options) {

        options = options || {};

        return this.each(function() {

            var $this = $(this);

            new $.jsbasket(this, options);

        });

    }

})(jQuery);
