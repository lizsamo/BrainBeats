from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
import sys

MODEL_NAME = "EleutherAI/gpt-neo-1.3B"

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)

# Move model to GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)

def generate_text(prompt, max_length=100):
    input_ids = tokenizer(prompt, return_tensors="pt").input_ids.to(device)
    output = model.generate(
        input_ids,
        max_length=max_length,
        temperature=0.9,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id
    )
    return tokenizer.decode(output[0], skip_special_tokens=True)

if __name__ == "__main__":
    user_prompt = sys.argv[1] if len(sys.argv) > 1 else "No prompt provided"
    print("🧠 Prompt:", user_prompt, file=sys.stderr)
    generated_text = generate_text(user_prompt)
    print(generated_text, flush=True)
