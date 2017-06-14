jQuery(function() {
    $("#datepicker").datepicker();
    $("#date-other-month").datepicker({
        showOtherMonths: true,
        selectOtherMonths: true
    });
    $("#month-year-menu").datepicker({
        changeMonth: true,
        changeYear: true
    });
    $("#multiple-month").datepicker({
        numberOfMonths: 2
            //showButtonPanel: true
    });
    $("#icon-trigger").datepicker({
        showOn: "both",
        buttonImage: "https://jqueryui.com/resources/demos/datepicker/images/calendar.gif",
        buttonImageOnly: true,
        numberOfMonths: 2,
        buttonText: "Select date"
    });
    $("#icon-trigger1").datepicker({
        showOn: "both",
        buttonImage: "https://jqueryui.com/resources/demos/datepicker/images/calendar.gif",
        buttonImageOnly: true,
        numberOfMonths: 2,
        buttonText: "Select date"
    });

    var dateFormat = "mm/dd/yy",
        from = $("#from")
        .datepicker({
            defaultDate: "+1w",
            changeMonth: true,
            numberOfMonths: 2,
            showOn: "both",
            buttonImage: "https://jqueryui.com/resources/demos/datepicker/images/calendar.gif",
            buttonImageOnly: true
        })
        .on("change", function() {
            to.datepicker("option", "minDate", getDate(this));
        }),
        to = $("#to").datepicker({
            defaultDate: "+1w",
            changeMonth: true,
            numberOfMonths: 2,
            showOn: "both",
            buttonImage: "https://jqueryui.com/resources/demos/datepicker/images/calendar.gif",
            buttonImageOnly: true
        })
        .on("change", function() {
            from.datepicker("option", "maxDate", getDate(this));
        });

    function getDate(element) {
        var date;
        try {
            date = $.datepicker.parseDate(dateFormat, element.value);
        } catch (error) {
            date = null;
        }

        return date;
    }
})