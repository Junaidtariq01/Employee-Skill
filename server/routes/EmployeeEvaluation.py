from Functions.evaluateEmployeeFunction import evaluateEmployee
from flask import request, jsonify

def EmployeeEvaluation(app, client, supabase):

    #signup/skillchange
    @app.route('/employee-evaluation', methods=['POST'])
    @app.route('/api/employee-evaluation', methods=['POST'])
    def employee_evaluation():
        employee_id = request.json.get('employee_id')
        if not employee_id:
            return jsonify({'error': 'employee_id is required'}), 400
        
        # Fetch all market trends from the database
        trends_response = supabase.table('market_trends').select('*').execute()
        market_trends = {
            'trends': trends_response.data if trends_response.data else []
        }
            
        # Fetch skills and experience for each employee
        emp_response = supabase.table('profiles').select('skills, experience_years').eq('id', employee_id).execute()
        emp_record = emp_response.data[0] if emp_response.data else None
        
        if emp_record:
            emp_data = {
                "skills": emp_record.get('skills', []),
                "experience_years": emp_record.get('experience_years', 0)
            }
            evaluation = evaluateEmployee(client, emp_data, market_trends)
            
            # Update employee record with score and review
            if evaluation:
                supabase.table('profiles').update({
                    'score': evaluation.get('score'),
                    'review': evaluation.get('review')
                }).eq('id', employee_id).execute()
                
                return jsonify({"status": "okay", "message": "Employee evaluation completed successfully"})
        
        return jsonify({"status": "error", "message": "Employee not found"})
    
