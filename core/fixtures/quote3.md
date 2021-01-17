I've a little problem.

I'm using NodeJS as backend. Now, an user has a field "biography", where the
user can write something about himself.

Suppose that this field has 220 maxlength, and suppose this as input:

    👶🏻👦🏻👧🏻👨🏻👩🏻👱🏻‍♀️👱🏻👴🏻👵🏻👲🏻👳🏻‍♀️👳🏻👮🏻‍♀️👮🏻👷🏻‍♀️👷🏻💂🏻‍♀️💂🏻🕵🏻‍♀️👩🏻‍⚕️👨🏻‍⚕️👩🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾👨🏻‍🌾

As you can see there aren't 220 emojis (there are 37 emojis), but if I do in my
nodejs server

    console.log(bio.length)

where bio is the input text, I got 221. How could I "parse" the string input to
get the correct length? Is it a problem about unicode?

**SOLVED**

I used this library: <https://github.com/orling/grapheme-splitter>

I tried that:

    var Grapheme = require('grapheme-splitter');
    var splitter = new Grapheme();
    console.log(splitter.splitGraphemes(bio).length);

and the length is 37. It works very well!
