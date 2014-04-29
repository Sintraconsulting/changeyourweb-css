/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var finanziamentoOnline="Finanziamento online";
var econselURL="https://reserved.e-consel.it/DOL/faces/frmECProntoTuo.jsp";
var oldDoPayment = doPayment;
var oldOnSuccessLoadStore1MS=onSuccessLoadStore1MS;
function onSuccessLoadStore1MS(){
    oldOnSuccessLoadStore1MS();
    //aggiungi elemento alla lista
    $("#fe_payment_method").append($("<option/>",{"value":finanziamentoOnline}).text(finanziamentoOnline));
}

function doCarmetPayment (form){
    var $form=$(form);
    if ($("#fe_payment_method option:selected").val()===finanziamentoOnline){
        
        var cartTotal = simpleCart.finalTotal;
        var total=parseFloat(cartTotal).toFixed(0);
        var items = simpleCart.items;   
        
        if ($form.attr("old-action")!=null && $form.attr("old-action")!='' && $form.attr("old-action")!=econselURL)
        {
            $form.attr("old-action",form.action);
        }
        form.action=econselURL;
        appendHiddenInput('tipoesec', "T", cartForm);
        appendHiddenInput('tabfin', "WIN", cartForm);
        appendHiddenInput('h_merce', "CA", cartForm);
        appendHiddenInput('impspe', total, cartForm);
        appendHiddenInput('impdafin', total, cartForm);
        appendHiddenInput('convenz', "0030334", cartForm);
        appendHiddenInput('indirizzo_mail',$("#fe_buyer_email").val(), cartForm);
        appendHiddenInput('indirizzo',$("#fe_buyer_address").val(), cartForm);
        appendHiddenInput('cognome', $("#fe_buyer_lastname").val(), cartForm);
        appendHiddenInput('nome', $("#fe_buyer_name").val(), cartForm);                
        
        var cont=1;
        var boughtData="Acquisto";
        for (var itemId in items) {
            var item = items[itemId];
            boughtData=boughtData + " " + item.name.replace(/\|/g,"");            
            
            if (item.attributes != null && item.attributes!='')
             boughtData=boughtData + " - "+ item.attributes + "";
            if (item.code != null && item.code!='')
             boughtData=boughtData + " ("+ item.code + ")";
            
            cont++;
        }
        
        appendHiddenInput('descri1',boughtData, cartForm);
        appendHiddenInput('parz1', total, cartForm);
        appendHiddenInput('ordine', (new Date().getTime()-new Date(2013,1,1,0,0,0).getTime()).toString(36), cartForm);
        form.method="post";
        form.submit();
    }
    else {
        if ($form.attr("old-action")!=null && $form.attr("old-action")!='' && $form.attr("old-action")!=econselURL)
        {
            form.action=$form.attr("old-action");
        }
        
        return oldDoPayment(form);
    }
}
doPayment=doCarmetPayment;


function getNewJQInput(name,type,value)
{
    return $("<input/>",{"type":type,"name":name,"value":value});
}

function checkEconselResultURL() {
    var url = location.href;
    var matches = url.match(/econsel=(ok|ko|ww)/);
    if (matches != null && matches.length == 2) {
        var result = matches[1];
        if (result == 'ko') {
            matches = url.match(/error=(.{1,})/);
            if (matches != null && matches.length > 1) {
                var error = matches[1];
                $('#orderError').append("<div>" + unescape(error) + "</div>");
            }

            $('#orderError').dialog({
                modal: true,
                resizable: false,
                draggable: false,
                dialogClass: "ui-message-dialog",
                close: function(event, ui) {
                    location.href = location.href.split("?")[0];
                }

            })
        } else if (result == 'ok') {
            emptyCart();
            $("#orderSuccess").dialog(
                    {
                        modal: true,
                        resizable: false,
                        draggable: false,
                        dialogClass: "ui-message-dialog",
                        close: function(event, ui) {
                            location.href = location.href.split("?")[0];
                        }

                    }
            );
        }else  {
            emptyCart();
            
            $('#orderSuccess').append("<br/><div style='font-weight:bold'>La tua transazione &egrave; stata accettata ed &egrave; in stato 'provvisorio'.<br/> Ti ricontatteremo appena possibile.</div>");
            $("#orderSuccess").dialog(
                    {
                        modal: true,
                        resizable: false,
                        draggable: false,
                        dialogClass: "ui-message-dialog",
                        close: function(event, ui) {
                            location.href = location.href.split("?")[0];
                        }

                    }
            );
        }
    }
}


$(document).ready(function(){
    checkEconselResultURL();
});