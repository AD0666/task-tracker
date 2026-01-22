import gdown
import os
import json
import time
import platform
import subprocess
import wmi  # Ensure you have installed the wmi module
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

# Configuration
GOOGLE_DRIVE_FILE_ID = os.getenv('GOOGLE_DRIVE_FILE_ID', '1L93tkLFIcHiNAra5Zc45m4nnNO2jtEOP')
TEMP_FILE_PATH = os.getenv('TEMP_FILE_PATH', 'login_check.json')
DEFAULT_STATUS = os.getenv('DEFAULT_STATUS', 'inactive')
DEFAULT_ID_AVAILABILITY = os.getenv('DEFAULT_ID_AVAILABILITY', 'no')

def get_system_uuid():
    """Retrieves the system UUID based on the operating system."""
    
    os_name = platform.system()
    
    if os_name == "Windows":
        try:
            c = wmi.WMI()
            return c.Win32_ComputerSystemProduct()[0].UUID
        except Exception as e:
            return f"Error retrieving UUID on Windows: {e}"

    elif os_name == "Linux":
        try:
            with open("/etc/machine-id", "r") as f:
                return f.read().strip()
        except FileNotFoundError:
            try:
                output = subprocess.check_output("cat /var/lib/dbus/machine-id", shell=True, text=True)
                return output.strip()
            except Exception as e:
                return f"Error retrieving UUID on Linux: {e}"

    elif os_name == "Darwin":  # macOS
        try:
            output = subprocess.check_output(
                "system_profiler SPHardwareDataType | grep 'UUID'", shell=True, text=True
            )
            return output.split(":")[1].strip()
        except Exception as e:
            return f"Error retrieving UUID on macOS: {e}"

    return "Unsupported OS"

def submit_to_google_form_login(uuid, username, password):
    """ Sends UUID, username, and password to Google Form via HTTP request. """
    form_url = "https://docs.google.com/forms/d/e/1FAIpQLSchO2oPr2XykFP_gi1MgqJVN6MPn7xIeyB2Y-jBa6kIc4xS9A/formResponse"
    data = {
        "entry.630407309": uuid,      # Replace with actual entry ID for UUID
        "entry.1832232282": username,  # Replace with actual entry ID for Username
        "entry.381960255": password      # Replace with actual entry ID for Dummy as password
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    response = requests.post(form_url, data=data, headers=headers)
    if response.status_code == 200:
        return True, "Login Data submitted successfully!"
    else:
        return False, f"Failed to submit login data. Status code: {response.status_code}"

def check_authentication(input_username, input_password, input_idnumber):
    """
    Checks authentication based on username, password, and status.
    If id_availability is 'yes', it verifies idnumber.
    If id_availability is 'no', it skips the idnumber check.
    Returns True if authentication is successful, otherwise False.
    """

    # Delete existing file before downloading
    if os.path.exists(TEMP_FILE_PATH):
        os.remove(TEMP_FILE_PATH)

    url = f'https://drive.google.com/uc?id={GOOGLE_DRIVE_FILE_ID}'

    try:
        # Download the file
        gdown.download(url, TEMP_FILE_PATH, quiet=True)

        # Verify file existence after download
        if not os.path.exists(TEMP_FILE_PATH):
            return False  # File download failed

        # Load JSON data
        with open(TEMP_FILE_PATH, 'r', encoding='utf-8') as file:
            data = json.load(file)

        # Authentication logic
        user_found = any(
            user['username'] == input_username and
            user['password'] == input_password and
            user.get('status', DEFAULT_STATUS).lower() == 'active' and
            (
                user.get('id_availability', DEFAULT_ID_AVAILABILITY).lower() == 'no' or  # Skip idnumber check if id_availability is 'no'
                (user.get('id_availability', DEFAULT_ID_AVAILABILITY).lower() == 'yes' and user.get('idnumber') == input_idnumber)
            )
            for user in data
        )

        # Delete the file after processing for security
        os.remove(TEMP_FILE_PATH)

        return user_found

    except json.JSONDecodeError:
        return False  # Invalid JSON format
    except Exception as e:
        print(f"Authentication error: {str(e)}")
        return False  # Handle unexpected errors

# if __name__ == "__main__":
#     input_username = input("Enter username: ").strip()
#     input_password = input("Enter password: ").strip()
#     input_idnumber = get_system_uuid()

#     if check_authentication(input_username, input_password, input_idnumber):
#         print("Authentication successful! User is active.")
#     else:
#         print("Invalid credentials, ID unavailable, or user is inactive.")

# time.sleep(5)