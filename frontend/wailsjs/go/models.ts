export namespace main {
	
	export class Config {
	    base_url: string;
	    projects: string[];
	    window_pos: string;
	    last_sync_time: number;
	    log_level: string;
	    log_to_file: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.base_url = source["base_url"];
	        this.projects = source["projects"];
	        this.window_pos = source["window_pos"];
	        this.last_sync_time = source["last_sync_time"];
	        this.log_level = source["log_level"];
	        this.log_to_file = source["log_to_file"];
	    }
	}
	export class Project {
	    id: string;
	    name: string;
	    shortName: string;
	    archived: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Project(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.shortName = source["shortName"];
	        this.archived = source["archived"];
	    }
	}
	export class Ticket {
	    id: string;
	    summary: string;
	    type: string;
	    priority: string;
	    sprints: string[];
	    url: string;
	
	    static createFrom(source: any = {}) {
	        return new Ticket(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.summary = source["summary"];
	        this.type = source["type"];
	        this.priority = source["priority"];
	        this.sprints = source["sprints"];
	        this.url = source["url"];
	    }
	}

}

