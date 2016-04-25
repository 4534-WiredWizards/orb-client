import './lib/es6-promise.min.js'
import Templates from './Templates'

export default {
  templates: {},
  components: {},
  create: function(done) {
    this.components.Progress = Ractive.extend({
       isolated: false,
       template: this.templates.progress,
       oninit: function() {
         const stat = this.get("stat");
         const value = this.get("value");
         let progressClass;
         for(let i = 0; i < stat.progress.length; i++) {
           if ((!stat.progress[i].min || value >= stat.progress[i].min) && (!stat.progress[i].max || value <= stat.progress[i].max)) {
             progressClass = stat.progress[i].class;
             break;
           }
         }
         this.set({
           min: stat.min,
           max: stat.max,
           width: (stat.min + value)/stat.max * 100,
           progressClass: progressClass,
         })
       },

    });
  },
  load: function(done) {
    const _this = this;
    return new Promise(function(resolve, reject) {
      Templates.get("components").then(function(templates) {
        $("<div>").html(templates).find("script.template").each(function() {
          const $this = $(this);
          _this.templates[$this.attr("name")] = $this.html().trim();
        });
        _this.create();
        resolve(_this);
      }).catch(reject);
    });
  },
};
