+function($) {
    'use strict';

    /*
     * VERSION 0.1.0
     * 
     * Requirements: Initial element is a <SELECT> with at least one <OPTGROUP>
     * <OPTGROUP> tags are as follow: <optgroup label="category name"</optgroup>
     * <OPTION> tags inside <OPTGROUP> tags are as follow: <option value="id">icon name</option>
     *
     * Methods:
     *  - init (called at initialization)
     *  - updateCategory (event)
     *  - updatePage (event)
     *  - allCommonSteps (called at init, updateCategory and updatePage)
     *  - getPaginationHtml (called by allCommonSteps)
     *
     * Pre-defined variables: 
     *  - (int) self.options.maxIconsPerPage
     *  - (string) self.options.allCategoriesText
     *  - (string) self.options.template
     *  - (string) self.options.iconSet
     *
     * Fixed variables:
     *  - (jQuery object) self.$wrapper
     *  - (jQuery object) self.$element
     *  - (string) self.paginationSelector
     *  - (string) self.iconContainerSelector
     *  - (jQuery object) self.$pagination
     *  - (jQuery object) self.$iconContainer
     *  - (object) self.fullIconList
     *
     * Dynamic variables:
     *  - (string) self.currentCategory (init with self.options.allCategoriesText)
     *  - (int) self.currentPage (init with 1 if select is empty or the page of the selected <option> page within self.options.allCategoriesText)
     *  - (string) self.currentIcon (init with empty if select is empty or the selected <option>'s text() of <option selected="selected">)
     *  - (array) self.filteredIconList
     *
     */

    // ICON PICKER CLASS DEFINITION
    // ===============================

    var FlatIconPicker = function(element, options) {
        this.init('flaticonpicker', element, options);
    };

    FlatIconPicker.DEFAULTS = {
        maxIconsPerPage: 35,
        allCategoriesText: 'All categories',
        iconSet: 'glyphicon',
        template: '<div class="row" data-flaticonpicker-wrapper-selector>' +

                        '<div class="col-xs-12 col-sm-7">' +
                            '<div class="row">' +
                                '<div data-flaticonpicker-iconcontainer class="col-xs-12">' +
                                '</div>' +
                            '</div>' +
                        '</div>' +

                        '<div class="col-xs-12 col-sm-5">' +
                                '<div class="row">' +
                                    '<div class="col-xs-12">' +
                                        '<select style="margin-top: 4px; border-color: #ccc;" data-flaticonpicker-select size="10" class="form-control">' +
                                        '</select>' +
                                    '</div>' +
                                '</div>' +

                                // pagination row
                                '<div class="row">' +
                                    '<div class="col-xs-12">' +
                                        '<ul class="pagination pagination-sm" data-flaticonpicker-pagination>' +
                                        '</ul>' +
                                    '</div>' +
                                '</div>' +
                        '</div>' +

                '</div>'
    };

    /* Called by the function above */
    FlatIconPicker.prototype.init = function(type, element, options) {

        // Initial variables.
        var self = this;

        self.type = type;

        self.$element = $(element);
        self.$element.hide();

        self.options = $.extend({}, FlatIconPicker.DEFAULTS, options);

        // Add template.
        self.$element.after(self.options.template);

        // Define selected elements.
        self.$wrapper = $('div[data-flaticonpicker-wrapper-selector] select[data-flaticonpicker-select]');
        self.$select = $('div[data-flaticonpicker-wrapper-selector] select[data-flaticonpicker-select]');
        // self.$leftPageButton = $('div[data-iconpicker-wrapper] li[data-iconpicker-leftbutton]');
        // self.$rightPageButton = $('div[data-iconpicker-wrapper] li[data-iconpicker-rightbutton]');

        // Define selectors.
        self.iconContainerSelector = 'div[data-flaticonpicker-wrapper-selector] div[data-flaticonpicker-iconcontainer]';
        self.paginationSelector = 'div[data-flaticonpicker-wrapper-selector] ul[data-flaticonpicker-pagination]';
        
        self.$pagination = $(self.paginationSelector);
        self.$iconContainer = $(self.iconContainerSelector);

        // Get source data from $element.
        self.fullIconList = {};

        self.fullIconList[self.options.allCategoriesText] = [];

        //  Get the list of icons if there is an optgroup.
        if (self.$element.find('optgroup').length) { 
            self.$element.find('optgroup').each(function() {

                // Get the OPTGROUP label and set it as key
                self.fullIconList[$(this).attr('label')] = [];

                var $that = $(this);

                $(this).find('option').each(function() {

                    // Push the OPTION label in the allCategoriesText
                    self.fullIconList[self.options.allCategoriesText].push($(this).text());
                    // Push the OPTION label in the current OPTGROUP label's array
                    self.fullIconList[$that.attr('label')].push($(this).text());
                });
            });
        } else {
            throw Error("The target <select> element does not contain any <optgroup>");
        }

        // Get OPTIONS to add after $select.
        var optionsHtml = '';

        for (var key in self.fullIconList) {
            if (self.fullIconList.hasOwnProperty(key)) {
                optionsHtml = optionsHtml + '<option>' + key + '</option>';
            }
        }

        // Add OPTIONS for $select.
        self.$select.append(optionsHtml);

        // Bind events.
        self.$select.on('change', $.proxy(self.updateCategory, self));

        // Define main variables.
        self.currentCategory = self.options.allCategoriesText;
        self.$select.find('option:contains(' + self.currentCategory + ')').attr('selected', 'selected');

        // Takes in consideration whether an option is already selected before initialization.
        // Note: .val() always returns the last value if SELECT is new. Hence cannot use .val() at init.
        // Note 2: find(option:selected) always returns an OPTION even when first displayed. Hence cannot use .val() at init.
        if (self.$element.find('option[selected=selected]').length) {

            var $elementSelectedOption = self.$element.find('option[selected=selected]');
            self.currentIcon = $elementSelectedOption.text();
            // p1 : 1-35, p2: 36-70, p3: 71-105, p4: 106-140, p5: 141-175 ...
            self.currentPage = Math.round(($elementSelectedOption.attr('value') / self.options.maxIconsPerPage) + 1);
        } else {
            self.currentPage = 1;
        }

        // allCommonSteps method is used every time an event is triggered on this object.
        self.allCommonSteps();
    };

    /*
     * Called with 'change' on self.$select.
     * Change self.currentPage then call allCommonSteps
     *
     */
    FlatIconPicker.prototype.updateCategory = function() {

        var self = this;

        // At init, in $select, the allCategories <option> has attribute selected="selected".
        // We need to reset it at first change by the user.
        if (self.$select.find('option[selected=selected]').length) {
            self.$select.find('option[selected=selected]').removeAttr('selected');
        }

        // main variables update.
        self.currentCategory = self.$select.val();
        // console.log(self.currentCategory);
        self.currentPage = 1;

        self.allCommonSteps();
    };

    /*
     * Called with 'click' events on <buttons. Lorsque event sur les boutons page précédente et page suivante.
     * Change self.currentPage then call allCommonSteps
     *
     */
    FlatIconPicker.prototype.updatePage = function(event) {

        // to avoid <a href="#"></a> change page view.
        event.preventDefault();

        var self = this;

        // main variables update.
        var pageToDisplay = $(event.target).closest('li').data('flaticonpicker-data-page');

        if (pageToDisplay == "next") {
            self.currentPage = self.currentPage + 1;
        } else if (pageToDisplay == "previous") {
            self.currentPage = self.currentPage - 1;
        } else {
            self.currentPage = pageToDisplay;
        }

        self.allCommonSteps();
    };


    /*
     * All these steps are used by the events and also by init.
     *
     */
    FlatIconPicker.prototype.allCommonSteps = function() {

        var self = this;

        // update filteredIconsListLength after main variables update.
        self.filteredIconsListLength = self.fullIconList[self.currentCategory].length;

        // Get the lists of icons to display.
        // update self.filteredIconList after main variables update.
        self.filteredIconList = [];

        if (self.filteredIconsListLength <= self.options.maxIconsPerPage) {
            self.filteredIconList = self.fullIconList[self.currentCategory];
        } else {
            var offset = (self.currentPage - 1) * self.options.maxIconsPerPage; /* page = 1 -> offset = 0, page 2 -> offset = 28 */
            var limit = Math.min(self.filteredIconsListLength, offset + self.options.maxIconsPerPage); /* page = 1 -> limit = 24, page = 2, -> limit = 49 */

            self.filteredIconList = self.fullIconList[self.currentCategory].slice(offset, limit);
        }

        // Update pagination.
        self.$pagination.replaceWith(self.getPaginationHtml());
        self.$pagination = $(self.paginationSelector);

        // Bind page Event
        self.$pagination.find('li[data-flaticonpicker-data-page]').each(function() {
            $(this).on('click', $.proxy(self.updatePage, self));
        });

        // Define the I list for the icons to display depending on the page.
        var iconsHtml = '<div data-flaticonpicker-iconcontainer class="col-xs-12">';

        for (var i = 0; i < self.filteredIconList.length; i++) {
            var activeClass = (self.currentIcon == self.filteredIconList[i]) ? ' active' : '';

            iconsHtml = iconsHtml + '<button style="margin: 4px" type="button" class="btn btn-default' + activeClass + '" ' +
                    'data-flaticonpicker-data-value="' + self.filteredIconList[i] + '">' +
                    // style borrowed from fa-fw and replaces fa-fw
                    '<i style="width: (18em / 14); text-align: center;" class="' + self.options.iconSet + ' ' + self.filteredIconList[i] + '"></i>' +
                '</button>';
        }

        iconsHtml = iconsHtml + '</div>';

        self.$iconContainer.replaceWith(iconsHtml);
        self.$iconContainer = $(self.iconContainerSelector);

        // Bind buttons events.
        self.$iconContainer.find('button').on('click', function() {

            // Remove active class from all buttons.
            self.$iconContainer.find('button').each(function() {

                if ($(this).hasClass("active")) {
                    $(this).removeClass("active");
                }
            });

            // Add active Class to the selected BUTTON.
            if (!$(this).hasClass("active")) {
                $(this).addClass("active");
            }

            // Updates the initial SELECT
            // icon-data-value is the icon name (e.g.: glyphicon-asterisk)
            self.currentIcon = $(this).data('flaticonpicker-data-value');

            var currentIconValue = self.$element.find('option:contains(' + self.currentIcon + ')').attr('value');
            self.$element.val(currentIconValue).change();
        });
    };



    FlatIconPicker.prototype.getPaginationHtml = function() {

        var self = this;

        var liHtml = '<ul class="pagination pagination-sm" data-flaticonpicker-pagination>';

        // Note: Updates $leftPageButton
        if (self.currentPage == 1) {
            liHtml = liHtml + '<li class="disabled"><span>&laquo;</a></span>';
        } else if (self.currentPage >= 2) {
            liHtml = liHtml + '<li data-flaticonpicker-data-page="previous"><a href="#">&laquo;</a></li>';
        }

        var rawMaxPage = self.filteredIconsListLength / self.options.maxIconsPerPage;
        self.maxPage = Math.ceil(rawMaxPage);

        var leftItemsCount = self.currentPage - 1;

        var rightItemsCount = self.maxPage - self.currentPage;

        // Note: The ".." count as a page.
        var maxLiEachSide = 3;

        var minItemsToDisplay = (self.maxPage >= (maxLiEachSide * 2)) ? maxLiEachSide * 2 : self.maxPage - 1;

        var computedLeftItemsCount = (leftItemsCount > maxLiEachSide) ? maxLiEachSide : leftItemsCount;

        var computedRightItemsCount = (rightItemsCount > maxLiEachSide) ? maxLiEachSide : rightItemsCount;

        var finalLeftItemsCount;
        var finalRightItemsCount;

        // Note: if not enough elements compared to the max number of displayable elements.
        if ((computedLeftItemsCount + computedRightItemsCount) < minItemsToDisplay) {

            if (leftItemsCount > maxLiEachSide) {
                finalLeftItemsCount = minItemsToDisplay - computedRightItemsCount;
                finalRightItemsCount = computedRightItemsCount;
            } else if (rightItemsCount > maxLiEachSide) {
                finalLeftItemsCount = computedLeftItemsCount;
                finalRightItemsCount = minItemsToDisplay - computedLeftItemsCount;
            }
        } else {
            finalLeftItemsCount = computedLeftItemsCount;
            finalRightItemsCount = computedRightItemsCount;
        }

        // Note: Step 1
        if (self.currentPage > 1) {
            liHtml = liHtml + '<li data-flaticonpicker-data-page="1">' +
                '<a href="#">1</a>' +
                '</li>';

            var startPosition = self.currentPage - (finalLeftItemsCount - 1);
            var endPosition = self.currentPage - 1;

            if ((self.currentPage - finalLeftItemsCount - 1) >= 1) {
                liHtml = liHtml + '<li><span>&middot;&middot;</span></li>';
                startPosition = startPosition + 1;
            }

            // Note: The -1 is to take into account the first fixed square.
            for (var i = startPosition; i <= endPosition; i++) {
                liHtml = liHtml + '<li data-flaticonpicker-data-page="' + i + '"><a href="#">' + i + '</a></li>';
            }
        }

        // Note: step 2
        liHtml = liHtml + '<li class="active"><span>' + self.currentPage + '</span></li>';

        // Note: step 3
        if (self.currentPage < self.maxPage) {

            var afterStartPosition = self.currentPage + 1;
            var afterEndPosition = self.currentPage + (finalRightItemsCount - 1);

            if ((self.maxPage - afterEndPosition) > 1) {
                afterEndPosition -= 1;
            }

            // Note: the -1 is to take into account the last fixed square.
            // Example: i = 1 + 1 = 2; i i <= 1 + 4 - 2 = 3
            for (var j = afterStartPosition; j <= afterEndPosition; j++) {
                liHtml = liHtml + '<li data-flaticonpicker-data-page="' + j + '"><a href="#">' + j + '</a></li>';
            }

            if ((self.maxPage - afterEndPosition) > 1) {
                liHtml = liHtml + '<li><span>&middot;&middot;</span></li>';
            }

            liHtml = liHtml + '<li data-flaticonpicker-data-page="' + self.maxPage + '">' +
                '<a href="#">' + self.maxPage + '</a></li>';
        }


        // Note: updates $rightPageButton        
        if (self.currentPage == self.maxPage) {
            liHtml = liHtml + '<li class="disabled"><span>&raquo;</span></li>';
        } else if (self.currentPage < self.maxPage) {
            liHtml = liHtml + '<li data-flaticonpicker-data-page="next"><a href="#">&raquo;</a></li>';
        }

        liHtml = liHtml + '</ul>';

        return liHtml;
    };

    /*
     * Destroy object.
     *
     */
    FlatIconPicker.prototype.destroy = function() {

        var self = this;

        // http://stackoverflow.com/questions/1386942/jquery-unbinding-is-it-necessary-replacing-elements
        self.$wrapper.remove();
  
        self.$element.removeData(self.type);
        self.$element.show();
    };

    // PLUGIN DEFINITION
    // =========================

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data('flaticonpicker');

            var options = typeof option === 'object' && option;

            if (!data && option == 'destroy') return;
            if (!data) { $this.data('flaticonpicker', (data = new FlatIconPicker(this, options))); }
            // Should be 'destroy' only.
            if (typeof option == 'string') { data[option](); }

        });
    }

    $.fn.flaticonpicker = Plugin;
    /* http://stackoverflow.com/questions/10525600/what-is-the-purpose-of-fn-foo-constructor-foo-in-twitter-bootstrap-js */
    $.fn.flaticonpicker.Constructor = FlatIconPicker;


}(jQuery);