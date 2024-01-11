import Handlebars from 'handlebars';

Handlebars.registerHelper('toJSON', function(obj) {
    return JSON.stringify(obj);
});

Handlebars.registerHelper('eq', function(a, b) {
    return a == b;
});


Handlebars.registerHelper('extractSlotKeys', function(obj) {
    const keys = [];
    console.log(obj)

    function iterate(obj) {
        for (const key in obj) {
            keys.push(key)
        }
    }

    iterate(obj);

    return keys;
});

Handlebars.registerHelper('getFormResponse', function(form, formData, responses) {
    let result = "";
    if(formData.ignored_intents) {
        console.log('worked');
        const formAnswer = formData.find(fd => fd.name === 'utter_ask_' + form);
        if(formAnswer) {
            console.log('got answer');
            console.log(formAnswer);
            result = formAnswer;
        }
    }
    return result;
})

Handlebars.registerHelper('getSlotsTextForForm', function(form, slots, responses){
    console.log('getSlotsTextForForm');
    console.log(form);
    console.log(slots);
    console.log(responses);
    const response = responses.find(res => res.name === form);
    if(response) {
        console.log('yes');
    } else {
        console.log('no')
    }
    return "fine";
})

Handlebars.registerHelper('checkV', function(request){
    console.log('CHECKING REQUEST');
    console.log(request);
})

Handlebars.registerHelper('ne', function(a, b) {
    return a !== b;
});

Handlebars.registerHelper('valueExists', function(array, value) {
    return array.includes(value);
})

Handlebars.registerHelper('removeEntityFromArray', function (entities, entityToRemove) {
    const index = entities.indexOf(entityToRemove);
    if(index > -1) {
        entities.splice(index, 1);
    }
    return entities
});

Handlebars.registerHelper('assign', function(varName, varValue, options) {
    if (!options.data.root) {
        options.data.root = {};
    }
    options.data.root[varName] = varValue;
});

Handlebars.registerHelper('sortEntities', function (entities) {
    return entities.sort((a,b) => a.name > b.name ? 1 : -1);
});

Handlebars.registerHelper('isInModel', function(intentTitle, intents) {
    const inModelIntents = intents?.inmodel;
    return Array.isArray(inModelIntents) ? inModelIntents.includes(intentTitle) : false;
});

Handlebars.registerHelper('getCount', function(intentTitle, intents) {
    const intentCounts = intents.count;
    const intentCount = intentCounts?.find(intent => intent.key === intentTitle)?.examples_counts?.value;
    return intentCount || 0;
});

export default Handlebars.helpers;
