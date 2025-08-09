#!/usr/bin/env python3
"""
Master Test Runner - Chạy tất cả các test và tạo báo cáo
"""

import subprocess
import time
import json
from datetime import datetime

def run_test_script(script_name, description):
    """Chạy một test script và capture output"""
    print(f"\n{'='*60}")
    print(f"🚀 {description}")
    print(f"{'='*60}")
    
    try:
        start_time = time.time()
        result = subprocess.run(
            ['python', script_name], 
            capture_output=True, 
            text=True, 
            timeout=300  # 5 minutes timeout
        )
        
        execution_time = time.time() - start_time
        
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        
        return {
            'script': script_name,
            'success': result.returncode == 0,
            'execution_time': execution_time,
            'stdout': result.stdout,
            'stderr': result.stderr
        }
        
    except subprocess.TimeoutExpired:
        print(f"❌ Test timeout after 5 minutes")
        return {
            'script': script_name,
            'success': False,
            'execution_time': 300,
            'error': 'Timeout'
        }
    except Exception as e:
        print(f"❌ Error running test: {e}")
        return {
            'script': script_name,
            'success': False,
            'execution_time': 0,
            'error': str(e)
        }

def main():
    print("🧪 VNStock API Master Test Suite")
    print("=" * 60)
    print(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # List of tests to run
    tests = [
        ('quick_test.py', 'Quick API Test'),
        ('test_all_apis.py', 'Comprehensive API Test'),
        ('advanced_test.py', 'Advanced Performance Test')
    ]
    
    results = []
    total_start_time = time.time()
    
    # Run each test
    for script, description in tests:
        result = run_test_script(script, description)
        results.append(result)
        
        # Small delay between tests
        time.sleep(2)
    
    total_time = time.time() - total_start_time
    
    # Generate summary
    print(f"\n{'='*60}")
    print("📊 TEST EXECUTION SUMMARY")
    print(f"{'='*60}")
    
    successful_tests = sum(1 for r in results if r['success'])
    total_tests = len(results)
    
    print(f"Total execution time: {total_time:.2f} seconds")
    print(f"Tests executed: {total_tests}")
    print(f"Successful: {successful_tests}")
    print(f"Failed: {total_tests - successful_tests}")
    print(f"Success rate: {(successful_tests/total_tests)*100:.1f}%")
    
    print(f"\nDetailed results:")
    for result in results:
        status = "✅" if result['success'] else "❌"
        print(f"{status} {result['script']} - {result['execution_time']:.2f}s")
        if not result['success'] and 'error' in result:
            print(f"   Error: {result['error']}")
    
    # Save detailed results
    report_data = {
        'timestamp': datetime.now().isoformat(),
        'total_execution_time': total_time,
        'summary': {
            'total_tests': total_tests,
            'successful': successful_tests,
            'failed': total_tests - successful_tests,
            'success_rate': (successful_tests/total_tests)*100
        },
        'results': results
    }
    
    with open('master_test_report.json', 'w', encoding='utf-8') as f:
        json.dump(report_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Detailed report saved to master_test_report.json")
    print(f"📋 API test report available in API_TEST_REPORT.md")
    
    if successful_tests == total_tests:
        print(f"\n🎉 All tests passed successfully!")
    else:
        print(f"\n⚠️  Some tests failed. Check the detailed report.")
    
    print(f"\nEnd time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
