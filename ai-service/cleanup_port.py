import subprocess
import os
import sys
import re

def free_port(port):
    """Identifies and terminates any process holding the specified port on Windows."""
    if sys.platform != 'win32':
        print(f"Port cleanup not implemented for {sys.platform}")
        return

    print(f"Checking for processes on port {port}...")
    try:
        # Get the PID of the process using the port
        output = subprocess.check_output(f'netstat -ano | findstr :{port}', shell=True).decode()
        pids = set()
        for line in output.strip().split('\n'):
            if 'LISTENING' in line:
                match = re.search(r'(\d+)$', line.strip())
                if match:
                    pids.add(match.group(1))

        if not pids:
            print(f"No processes found on port {port}.")
            return

        current_pid = str(os.getpid())
        parent_pid = str(os.getppid()) if hasattr(os, 'getppid') else None
        
        for pid in pids:
            if pid == current_pid or pid == parent_pid:
                continue
            print(f"Terminating process {pid} on port {port}...")
            subprocess.run(f"taskkill /F /PID {pid}", shell=True, capture_output=True)
        
        print(f"Port {port} should now be free.")
    except subprocess.CalledProcessError:
        print(f"No active listeners found on port {port}.")
    except Exception as e:
        print(f"Error freeing port {port}: {e}")

if __name__ == "__main__":
    free_port(8000)
