from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# Load GPT-Neo model (1.3B version)
MODEL_NAME = "EleutherAI/gpt-neo-1.3B"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)

def generate_text(prompt, max_length=100):
    """
    Generate text using GPT-Neo based on the input prompt.
    
    Args:
        prompt (str): The text prompt to start the generation.
        max_length (int): Maximum number of tokens to generate.
    
    Returns:
        str: The generated text.
    """
    # Tokenize input prompt
    input_ids = tokenizer(prompt, return_tensors="pt").input_ids
    
    # Generate text
    output = model.generate(input_ids, max_length=max_length, temperature=0.9, do_sample=True)
    
    # Decode output tokens
    return tokenizer.decode(output[0], skip_special_tokens=True)

# Example usage
if __name__ == "__main__":
    user_prompt = input("Enter a prompt: ")
    generated_text = generate_text(user_prompt)
    print("\nGenerated Text:\n", generated_text)
