interface GHRepo {
	name: string;
	full_name: string;
	fork: boolean;
	owner: {
		login: string;
	};
}

const owner = 'aaronhuggins';
const response = await fetch(`https://api.github.com/users/${owner}/repos?per_page=100`);
const data: GHRepo[] = await response.json();

for (const repo of data) {
	if (!repo.fork && repo.owner.login === owner) {
		console.log(repo.full_name);
	}
}
