/*!
 * jquery.customSelect() - v0.5.1
 * http://adam.co/lab/jquery/customselect/
 * 2014-03-19
 *
 * Copyright 2013 Adam Coulombe
 * @license http://www.opensource.org/licenses/mit-license.html MIT License
 * @license http://www.gnu.org/licenses/gpl.html GPL2 License 
 */

(function ($) {
    'use strict';

    $.fn.extend({
        customSelect: function (options) {
            // filter out <= IE6
            if (typeof document.body.style.maxHeight === 'undefined') {
                return this;
            }
            var defaults = {
                    customClass: 'customSelect',
                    mapClass:    true,
                    mapStyle:    true
            },
            options = $.extend(defaults, options),
            prefix = options.customClass,
            changed = function ($select,customSelectSpan) {
                var currentSelected = $select.find(':selected'),
                customSelectSpanInner = customSelectSpan.children(':first'),
                html = currentSelected.html() || '&nbsp;';

                if(customSelectSpan.hasClass(getClass('NoWrap')) == true)
                {
                    noWrapTextApply(customSelectSpan, html) 
                }
                else
                {
                    customSelectSpanInner.html(html);
                }
                
                if (currentSelected.attr('disabled')) {
                    customSelectSpan.addClass(getClass('DisabledOption'));
                } else {
                    customSelectSpan.removeClass(getClass('DisabledOption'));
                }
                
                setTimeout(function () {
                    customSelectSpan.removeClass(getClass('Open'));
                    $(document).off('mouseup.customSelect');   
                    $select.css({
                        width:                customSelectSpan.outerWidth()
                    });               
                }, 60);
            },

            noWrapTextApply = function(customSelectSpan, txt){
                var arrWords = txt.split(' '),
                    arrLetters = txt.split(''),
                    label = customSelectSpan.find('.' + getClass('Inner')),
                    testLabel = customSelectSpan.find('.' + getClass('TestInner')),
                    maxWidth = customSelectSpan.width(),
                    finishText = '...',
                    tempText = txt;

                testLabel.html(txt);
                if(testLabel.width() > maxWidth)
                {
                    if(arrWords.length > 1)
                    {
                        for(var i = arrWords.length - 1; i >= 0; --i)
                        {
                            tempText = '';
                            for(var j = 0, total = i; j < total; ++j)
                            {
                                tempText = tempText + ((j == 0) ? arrWords[j] : ' ' + arrWords[j]);
                            }
                            testLabel.html(tempText + finishText);
                            if(testLabel.width() < maxWidth)
                            {
                                tempText = tempText + finishText;
                                break;
                            }
                        }
                    }
                    else
                    {
                        for(var i = arrLetters.length - 1; i >= 0; --i)
                        {
                            tempText = '';
                            for(var j = 0, total = i; j < total; ++j)
                            {
                                tempText = tempText + arrLetters[j];
                            }
                            testLabel.html(tempText + finishText);
                            if(testLabel.width() > maxWidth)
                            {
                                tempText = tempText + finishText;
                                break;
                            }
                        }
                    }
                    label.html(tempText);
                }
                else
                {
                    label.html(txt);
                }
            },

            getClass = function(suffix){
                return prefix + suffix;
            };

            return this.each(function () {
                var $select = $(this),
                    customSelectInnerSpan = $('<span>2</span>').addClass(getClass('Inner')),
                    customSelectInnerTestSpan = $('<span>2</span>').addClass(getClass('TestInner')).html('...'),
                    customSelectSpan = $('<span />');

                $select.after(customSelectSpan.append(customSelectInnerSpan));
                $select.after(customSelectSpan.append(customSelectInnerTestSpan));
                
                customSelectSpan.addClass(prefix);

                if (options.mapClass) {
                    customSelectSpan.addClass($select.attr('class'));
                }
                if (options.mapStyle) {
                    customSelectSpan.attr('style', $select.attr('style'));
                }
                if(options.noWrap) {
                    customSelectSpan.addClass(getClass('NoWrap'));
                }

                $select
                    .addClass('hasCustomSelect')
                    .on('render.customSelect', function () {
                        $select.css('width','');            
                        var selectBoxWidth = parseInt($select.outerWidth(), 10) -
                                (parseInt(customSelectSpan.outerWidth(), 10) -
                                    parseInt(customSelectSpan.width(), 10));
                        
                        // Set to inline-block before calculating outerHeight
                        customSelectSpan.css({
                            display: 'inline-block'
                        });
                        
                        var selectBoxHeight = customSelectSpan.outerHeight();

                        if ($select.attr('disabled')) {
                            customSelectSpan.addClass(getClass('Disabled'));
                        } else {
                            customSelectSpan.removeClass(getClass('Disabled'));
                        }

                        customSelectInnerSpan.css({
                            width:   selectBoxWidth,
                            display: 'inline-block'
                        });

                        $select.css({
                            '-webkit-appearance': 'menulist-button',
                            width:                customSelectSpan.width(),
                            position:             'absolute',
                            opacity:              0,
                            height:               selectBoxHeight,
                            fontSize:             customSelectSpan.css('font-size')
                        });

                        changed($select,customSelectSpan);
                    })
                    .on('change.customSelect', function () {
                        customSelectSpan.addClass(getClass('Changed'));
                        changed($select,customSelectSpan);
                    })
                    .on('keyup.customSelect', function (e) {
                        if(!customSelectSpan.hasClass(getClass('Open'))){
                            $select.trigger('blur.customSelect');
                            $select.trigger('focus.customSelect');
                        }else{
                            if(e.which==13||e.which==27){
                                changed($select,customSelectSpan);
                            }
                        }
                    })
                    .on('mousedown.customSelect', function () {
                        customSelectSpan.removeClass(getClass('Changed'));
                    })
                    .on('mouseup.customSelect', function (e) {
                        
                        if( !customSelectSpan.hasClass(getClass('Open'))){
                            // if FF and there are other selects open, just apply focus
                            if($('.'+getClass('Open')).not(customSelectSpan).length>0 && typeof InstallTrigger !== 'undefined'){
                                $select.trigger('focus.customSelect');
                            }else{
                                customSelectSpan.addClass(getClass('Open'));
                                e.stopPropagation();
                                $(document).one('mouseup.customSelect', function (e) {
                                    if( e.target != $select.get(0) && $.inArray(e.target,$select.find('*').get()) < 0 ){
                                        $select.trigger('blur.customSelect');
                                    }else{
                                        changed($select,customSelectSpan);
                                    }
                                });
                            }
                        }
                    })
                    .on('focus.customSelect', function () {
                        customSelectSpan.removeClass(getClass('Changed')).addClass(getClass('Focus'));
                    })
                    .on('blur.customSelect', function () {
                        customSelectSpan.removeClass(getClass('Focus')+' '+getClass('Open'));
                    })
                    .on('mouseenter.customSelect', function () {
                        customSelectSpan.addClass(getClass('Hover'));
                    })
                    .on('mouseleave.customSelect', function () {
                        customSelectSpan.removeClass(getClass('Hover'));
                    })
                    .trigger('render.customSelect');
            });
        }
    });
})(jQuery);