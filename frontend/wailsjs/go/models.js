export var main;
(function (main) {
    class Config {
        static createFrom(source = {}) {
            return new Config(source);
        }
        constructor(source = {}) {
            if ('string' === typeof source)
                source = JSON.parse(source);
            this.base_url = source["base_url"];
            this.projects = source["projects"];
            this.window_pos = source["window_pos"];
            this.last_sync_time = source["last_sync_time"];
            this.log_level = source["log_level"];
            this.log_to_file = source["log_to_file"];
        }
    }
    main.Config = Config;
    class Project {
        static createFrom(source = {}) {
            return new Project(source);
        }
        constructor(source = {}) {
            if ('string' === typeof source)
                source = JSON.parse(source);
            this.id = source["id"];
            this.name = source["name"];
            this.shortName = source["shortName"];
            this.archived = source["archived"];
        }
    }
    main.Project = Project;
    class Ticket {
        static createFrom(source = {}) {
            return new Ticket(source);
        }
        constructor(source = {}) {
            if ('string' === typeof source)
                source = JSON.parse(source);
            this.id = source["id"];
            this.summary = source["summary"];
            this.type = source["type"];
            this.priority = source["priority"];
            this.sprints = source["sprints"];
            this.url = source["url"];
        }
    }
    main.Ticket = Ticket;
})(main || (main = {}));
