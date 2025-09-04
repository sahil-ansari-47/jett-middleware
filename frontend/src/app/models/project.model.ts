
export interface Project {
  deploy_id: string;
  project_name: string;
  status: 'uploaded' | 'building' | 'deployed' | 'failed';
  user_id: string;
  username: string;
  deployed_url: string;
  repo_link: string;
  last_commit_message: string;
  last_commit_datetime: string;
  createdAt: Date;
  createdAtString: string;
  branch_name: string;
}
