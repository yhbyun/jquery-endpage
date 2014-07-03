;(function ($, window, document, undefined) {
    "use strict";

    var defaults = {
            animation: "fade",
            from: "50%",
            to: "110%"
        },
        $window = $(window),
        $document = $(document),
        endPages = [],
        created = false,
        didScroll = false;

    // The actual plugin constructor
    function EndPage (element, options) {
        this.$element = $(element);
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = 'EndPage';
        this._fromY = "";
        this._toY = "";
        this._onAnimate = false;
        this.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend(EndPage.prototype, {
        init: function () {
            this.$element.hide();
            this.$element.data('status', 'off');
            this.adjustRange();
        },
        adjustRange: function () {
            var docHeight, from, to;

            from = this.settings.from;
            if (from.toString().indexOf('%') >= 0) {
                docHeight = $document.height() - $window.height();
                this._fromY = (parseInt(from) / 100) * docHeight;
            } else {
                this._fromY = from;
            }

            to = this.settings.to;
            if (to.toString().indexOf('%') >= 0) {
                docHeight = $document.height() - $window.height();
                this._toY = (parseInt(to) / 100) * docHeight;
            } else {
                this._toY = to;
            }
        },
        scroll: function(yPos) {
            if (yPos >= this._fromY && yPos <= this._toY) {
                if (this.$element.is(':hidden') && this.$element.data('status') === 'off') {
                    this.$element.data('status', 'on');
                    animation(this.$element, 'show', this.settings);
                }
            } else {
                if (this.$element.is(':visible') && this.$element.data('status') === 'off') {
                    this.$element.data('status', 'on');
                    animation(this.$element, 'hide', this.settings);
                }
            }
        }
    });


    $.fn.endpage = function (options) {
        this.each(function() {
            var endPage;

            if (! $.data(this, 'plugin_endpage')) {
                endPage = new EndPage(this, options);
                endPages.push(endPage);
                $.data(this, 'plugin_endpage', endPage);
            }
        });

        if (! created) {
            $window.scroll(function() {
                didScroll = true;
            }).resize(function () {
                $.endpageSize();
            });

            setInterval(function() {
                if (didScroll) {
                    didScroll = false;
                    for (var i = 0; i < endPages.length; i++ )  {
                        endPages[i].scroll($document.scrollTop());
                    }
                }
            }, 250);

            created = true;
        }
        return this;
    };

    $.endpageSize = function() {
        for (var i = 0; i < endPages.length; i++ )  {
            endPages[i].adjustRange();
        }
    };

    function animation($element, display, settings) {
        switch (settings.animation) {
            case false:
                if (display === 'show') {
                    $element.show('fast');
                    $element.data('status', 'off');
                } else {
                    $element.hide('fast');
                    $element.data('status', 'off');
                }
                break;

            case 'fade':
                if (display === 'show') {
                    $element.fadeIn('fast', function() {
                        $element.data('status', 'off');
                    });

                } else {
                    $element.fadeOut('fast', function() {
                        $element.data('status', 'off');
                    });

                }
                break;

            case 'slide':
                if (display === 'show') {
                    $element.slideDown('fast', function() {
                        $element.data('status', 'off');
                    });
                } else {
                    $element.slideUp('fast', function() {
                        $element.data('status', 'off');
                    });
                }
                break;

            default:
                animationClassChange($element, display, settings);
                break;
        }
    }

    function animationClassChange($element, display, settings) {
        if (display === 'show') {
            $element.addClass('animation-' + settings.animation).show();
            $element.one('webkitAnimationEnd animationend msAnimationEnd oAnimationEnd animationEnd', function(e) {
                $element.data('status', 'off');
                $element.removeClass('animation-' + settings.animation);
            });
        } else {
            var outAnimation = settings.animation.replace('In', 'Out');
            $element.addClass('animation-' + outAnimation);
            $element.one('webkitAnimationEnd animationend msAnimationEnd oAnimationEnd animationEnd', function(e) {
                $element.data('status', 'off');
                $element.removeClass('animation-' + outAnimation).hide();
            });
        }
    }
})(jQuery, window, document);
