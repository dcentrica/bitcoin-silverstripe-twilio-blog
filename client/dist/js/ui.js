/**
 * Simple jQuery routines to pass some feedback to users as they wait for
 * Bitcoin transactions to confirm. This would be improved using some sorcery from
 * Vue or React.
 */

// The frequency at which we will hit our own endpoint
var interval = 10000;
var isStopped = false;
var timer = 0;
var timeLimit = 60;
var message = 'Awaiting payment..';

/**
 * If we're still waiting for a payment to arrive after a given time limit,
 * just give up and signal as such to the user.
 */
setInterval(function() {
    timer++;
    
    if (timer >= timeLimit) {
        message = 'Timeout: Payment not received. Giving up.';
        isStopped = true;
        return;
    }
}, 1000);

(function($) {
    $(function() {
        $('.sms-trigger').blur(function(e) {            
            var body = $('[name="Body"]').val();
            var phone = $('[name="PhoneTo"]').val();
            var address = $('[name="Address"]').val();
            var amount = $('[name="Amount"]').val();
            var endpointConf = $(this).closest('form').data('uri-confirmation');
            
            if (!(body.length && phone.length)) {
                return;
            }
            
            // 
            
            // Append the spinner
            uiSpinnerComponent(message);
            
            // Repeatedly hit the endpoint until such time as we redirect.
            // This is pretty cludgy but it works.
            setInterval(function() {
                // Prevent repeated non-200 responses from controller endpoint
                if (isStopped) {
                    uiErrorComponent('Upstream error. Stopping');
                    return;
                }
                
                $.ajax({
                    'type': 'POST',
                    'dataType': 'json',
                    'data': {
                        'Body': body,
                        'PhoneTo': phone,
                        'Address': address,
                        'Amount': amount
                    },
                    'url': endpointConf
                })
                // Exceptions from API clients result in non 200 HTTP codes
                .fail(function (jqXHR, textStatus, errorThrown) {
                    isStopped = true;
                })
                .done(function(data, textStatus, jqXHR) {            
                    switch (data) {
                        case 0:
                        default:
                            message = message;
                            break;
                        case 1:
                            message = 'Broadcasting..';
                            break;
                        case 2:
                            message = 'Confirming..';
                            break;
                        case 3:
                            message = 'Confirmed! Message sent.';
                            break;
                        case 4:
                            message = 'Error';
                            // Prevent repeated non-200 responses from controller endpoint
                            isStopped = true;
                            break;
                    }

                    // Show animation with appropriate message
                    uiSpinnerComponent(message);
                });
            }, interval);
        });
    });
})(jQuery);


/**
 * Attach an "In Progress" CSS animation to the DOM and render an appropriate message.
 * 
 * @param  {String} message
 * @return {Void}
 */
function uiSpinnerComponent(message) {
    // If it already exists in the DOM, no need to do it again
    if ($('.spinner-wrapper').length) {
        $('.spinner-wrapper').remove();
    }
    
    // Create and re-attach with message
    $spinner = $('' +
    '<div class="spinner-wrapper hide">' +
        '<p class="message">' + message + '</p>' +
        '<div class="lds-ripple">' +
            '<div>' +
            '</div>' +
            '<div>' +
            '</div>' +
        '</div>' +
    '</div>');
      
    $spinner.appendTo('body');
}

/**
 * Attach an "Error" CSS animation to the DOM and render an appropriate message.
 * 
 * @param  {String} message
 * @return {Void}
 */
function uiErrorComponent(message) {
    // Create and re-attach with message
    $error = $('' +
    '<div class="error-wrapper hide">' +
        '<p class="message">' + message + '</p>' +
    '</div>');
      
    $error.appendTo('body');
}
