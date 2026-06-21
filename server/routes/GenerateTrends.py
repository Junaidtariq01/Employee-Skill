from Functions.generateTrendsFunction import generateNewTrends
from Functions.evaluateEmployeeFunction import evaluateEmployee
from flask import request, jsonify

def GenerateTrends(app, client, supabase):

    @app.route('/generate-trends', methods=['POST'])
    @app.route('/api/generate-trends', methods=['POST'])
    def generate_trends():
        try:
            payload = request.get_json(silent=True) or {}
            description = (payload.get('description') or '').strip()
            if not description:
                return jsonify({"status": "error", "message": "description is required"}), 400

            market_trends = generateNewTrends(client, description)
            raw_trends = []
            if market_trends:
                raw_trends = market_trends.get('trends') or market_trends.get('skills') or []

            trends_to_insert = []
            for trend in raw_trends:
                metric_name = (trend.get('metric_name') or '').strip()
                category = (trend.get('category') or 'General').strip()

                try:
                    value = int(float(trend.get('value', 0)))
                except (TypeError, ValueError):
                    value = 0

                if not metric_name:
                    continue

                trends_to_insert.append({
                    'metric_name': metric_name,
                    'value': str(max(0, min(100, value))),
                    'category': category,
                    'source_api': 'groq/openai-gpt-oss-20b'
                })

            if not trends_to_insert:
                return jsonify({"status": "error", "message": "No trends were generated from the AI response"}), 502

            supabase.table('market_trends').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
            supabase.table('market_trends').insert(trends_to_insert).execute()

            response = supabase.table('profiles').select('id, skills, experience_years, score').eq('role', 'employee').execute()
            employees = response.data or []

            updated_count = 0
            grade_history_records = []

            for employee in employees:
                employee_id = employee['id']
                emp_data = {
                    "skills": employee.get('skills') or [],
                    "experience_years": employee.get('experience_years') or 0
                }
                evaluation = evaluateEmployee(client, emp_data, {"trends": trends_to_insert, "description": description})

                if not evaluation:
                    continue

                try:
                    new_score = int(float(evaluation.get('score', 0)))
                except (TypeError, ValueError):
                    new_score = 0

                new_score = max(0, min(100, new_score))
                old_score = employee.get('score') or 0

                supabase.table('profiles').update({
                    'score': new_score,
                    'review': evaluation.get('review') or ''
                }).eq('id', employee_id).execute()
                updated_count += 1

                if old_score != new_score:
                    grade_history_records.append({
                        'profile_id': employee_id,
                        'old_grade': old_score,
                        'new_grade': new_score,
                        'reason': 'Market Trend Update'
                    })

            if grade_history_records:
                supabase.table('grade_history').insert(grade_history_records).execute()

            return jsonify({
                "status": "okay",
                "message": "Market trends synced and employee scores recalculated successfully",
                "trends_updated": len(trends_to_insert),
                "employees_rescored": updated_count,
                "grade_history_records": len(grade_history_records)
            })
        except Exception as e:
            print(f"generate_trends failed: {e}")

            if not app.config.get("SUPABASE_HAS_SERVICE_ROLE"):
                return jsonify({
                    "status": "error",
                    "message": "Backend writes require SUPABASE_SERVICE_ROLE_KEY in .env. The current anon key can read data but cannot update trends or employee scores."
                }), 500

            return jsonify({
                "status": "error",
                "message": f"Trend generation failed: {str(e)}"
            }), 500
